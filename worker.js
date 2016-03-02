var debug = require('debug')('clickberry:user-admin:worker');
var mongoose = require('mongoose');
var config = require('clickberry-config');
var Bus = require('./lib/bus-service');
var User = require('./models/user-admin');

var bus = new Bus({
    lookupdHTTPAddresses: config.get('nsqlookupd:addresses').split(','),
    maxAttempts: 5
});

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    },
    replset: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
};
mongoose.connect(config.get('mongodb:connection'), options);

bus.on('account-create', function (e) {
    var account = e.account;
    var user = new User({
        _id: account.id,
        role: account.role,
        created: account.created,
        storageUsed: 0,
        memberships: [account.membership]
    });

    debug(account);
    user.save(function (err) {
        if (err) {
            debug(err);
            return e.message.requeue();
        }

        e.message.finish();
    });
});

bus.on('account-delete', function (e) {
    var account = e.account;
    debug(account);
    User.remove({_id: account.id}, function (err) {
        if (err) {
            debug(err);
            return e.message.requeue();
        }

        debug(arguments);
        e.message.finish();
    });
});

// Temporary DISABLED
bus.on('account-merge', function (e) {
    var merges = e.merges;
    debug(merges);
    User.findById(merges.toUserId, function (err, toUser) {
        if (err) {
            debug(err);
            return e.message.requeue();
        }

        if (!toUser) {
            debug('User with id ' + merges.toUserId + ' not found.');
            return e.message.finish();
        }

        User.findById(merges.fromUserId, function (err, formUser) {
            if (err) {
                debug(err);
                return e.message.requeue();
            }

            if (!formUser) {
                debug('User with id ' + merges.fromUserId + ' not found.');
                return e.message.finish();
            }

            toUser.memberships = toUser.memberships.concat(formUser.memberships);
            toUser.storageUsed += formUser.storageUsed;
            toUser.save(function (err) {
                if (err) {
                    debug(err);
                    return e.message.requeue();
                }

                formUser.remove(function (err) {
                    if (err) {
                        debug(err);
                        return e.message.requeue();
                    }

                    return e.message.finish();
                });
            });
        });
    });
});

// Temporary DISABLED
bus.on('account-unmerge', function (e) {
    var account = e.account;
    debug(account);
    User.findByIdAndUpdate(
        account.id,
        {
            $pull: {
                memberships: {
                    provider: account.membership.provider,
                    id: account.membership.id
                }
            }
        },
        function (err) {
            if (err) {
                debug(err);
                return e.message.requeue();
            }

            e.message.finish();
        });
});


bus.on('video-create', function (e) {
    var video = e.video;
    User.findByIdAndUpdate(
        video.userId,
        {$inc: {storageUsed: video.size}},
        function (err) {
            if (err) {
                debug(err);
                return e.message.requeue();
            }

            e.message.finish();
        });
});

bus.on('video-delete', function (e) {
    var video = e.video;
    User.findByIdAndUpdate(
        video.userId,
        {$inc: {storageUsed: -video.size}},
        function (err) {
            if (err) {
                debug(err);
                return e.message.requeue();
            }

            e.message.finish();
        });
});

debug('Listening for messages...');