
const smartcard = require('smartcard');
const CTime = require('china-time');
const bh = require('./bufferhelp');
const hexify = require('hexify');
const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;

const devices = new Devices();
const CommandApdu = smartcard.CommandApdu;

// var SELECT = '00A404000ED196300077130010000000020101';
var SELECT = 'D196300077130010000000020101';
var account_command = '8022000000';
var GET_RESPONSE = [0x00, 0xc0, 0, 0];

var __time__ = () => { return `${CTime("YYYY-MM-DD HH:mm:ss")}` };

// device - card
devices.on('device-activated', event => {
    const currentDevices = event.devices;
    let device = event.device;

    console.log(`>>> [${__time__()}] Device :'${device}' Activated`);
    console.log(`>>> [${__time__()}] CurrentDevices:'${currentDevices}'`);

    device.on('card-inserted', event => {
        var card = event.card;
        const application = new Iso7816Application(card);

        console.log(`>>> [${__time__()}] Card '${card.getAtr()}' Inserted into '${event.device}'`);

        card.on('command-issued', event => {
            // console.log('event:',event);
            console.log(`>>> [${__time__()}] Command issued '${event.command}' to '${event.card}'`);
        })

        var iLoop = 0;

        card.on('response-received', event => {
            console.log(`>>> [${__time__()}] Response '${event.response}' received from '${event.card}' --- in response to Command '${event.command}'`);
            // while (event.response.data.slice(0, 2) == '61' && iLoop < 32) {
            //     // var a = 1;
            //     application.issueCommand(new CommandApdu({ bytes: [0x00, 0xc0, 0x00, 0x00,] }))
            //     iLoop += 1;
            // }
        })


        application.selectFile(hexify.toByteArray(SELECT))
            .then((response) => {
                console.info(`>>> [${__time__()}] Select PSE Response: '${response}' *** '${response.meaning()}'`);
                // return application.issueCommand(new CommandApdu({ bytes: [0x80, 0x22, 0x02, 0x00, 0x02, 0x00, 0x00] }));
                application.issueCommand(new CommandApdu({ bytes: hexify.toByteArray(account_command) }));
            })
            .catch((error) => {
                console.error('>>> [${__time__()}] Error:', error, error.stack);
            });
    })

    device.on('card-removed', event => {
        console.log(`>>> [${__time__()}] Card remove from '${event.name}'`);
    })
})

devices.on('device-deactivated', event => {
    console.log(`>>> [${__time__()}] Device '${event.device}' Deactivated`);
})
