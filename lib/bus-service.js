var events = require('events');
var util = require('util');
var nsq = require('nsqjs');

function Bus(options) {
    var bus = this;
    events.EventEmitter.call(this);

    var accountCreatesReader = new nsq.Reader('account-creates', 'user-admin', options);
    var accountDeletesReader = new nsq.Reader('account-deletes', 'user-admin', options);
    var accountMergesReader = new nsq.Reader('account-merges', 'user-admin', options);
    var accountUnmergesReader = new nsq.Reader('account-unmerges', 'user-admin', options);

    var videoCreatesReader = new nsq.Reader('video-creates', 'user-admin', options);
    var videoDeletesReader = new nsq.Reader('video-deletes', 'user-admin', options);

    accountCreatesReader.connect();
    accountCreatesReader.on('message', function (message) {
        var e = {
            account: message.json(),
            message: message
        };

        bus.emit('account-create', e);
    });

    accountDeletesReader.connect();
    accountDeletesReader.on('message', function (message) {
        var e = {
            account: message.json(),
            message: message
        };

        bus.emit('account-delete', e);
    });

    // Temporary DISABLED
    accountMergesReader.connect();
    accountMergesReader.on('message', function (message) {
        //var e = {
        //    merges: message.json(),
        //    message: message
        //};
        //
        //bus.emit('account-merge', e);
        message.finish();
    });

    // Temporary DISABLED
    accountUnmergesReader.connect();
    accountUnmergesReader.on('message', function (message) {
        //var e = {
        //    account: message.json(),
        //    message: message
        //};
        //
        //bus.emit('account-unmerge', e);
        message.finish();
    });


    videoCreatesReader.connect();
    videoCreatesReader.on('message', function (message) {
        var e = {
            video: message.json(),
            message: message
        };

        bus.emit('video-create', e);
    });

    videoDeletesReader.connect();
    videoDeletesReader.on('message', function (message) {
        var e = {
            video: message.json(),
            message: message
        };

        bus.emit('video-delete', e);
    });
}

util.inherits(Bus, events.EventEmitter);

module.exports = Bus;