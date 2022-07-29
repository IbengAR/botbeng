"use strict";
const { default: makeWASocket, BufferJSON, initInMemoryKeyStore, DisconnectReason, AnyMessageContent, delay, useSingleFileAuthState, makeInMemoryStore } = require("@adiwajshing/baileys-md")
const figlet = require("figlet");
const fs = require("fs");
const P = require('pino')
const ind = require('./help/ind')
const { color, ChikaLog } = require("./lib/color");
let setting = JSON.parse(fs.readFileSync('./config.json'));
let sesion = `./${setting.sessionName}.json`
const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) })
store.readFromFile('./baileys-md.json')
setInterval(() => {
	store.writeToFile('./baileys-md.json')
}, 10_000)
const { state, saveState } = useSingleFileAuthState(sesion)


const start = async () => {
    //Meng weem
	console.log(color(figlet.textSync('iBeng Bot MD', {
		font: 'Standard',
		horizontalLayout: 'default',
		vertivalLayout: 'default',
		whitespaceBreak: false
	}), 'cyan'))
	console.log(color('[ By Rizky iBeng ]'))
    // set level pino ke fatal kalo ga mau nampilin log eror
    const chika = makeWASocket({ printQRInTerminal: true, logger: P({ level: 'silent' }), auth: state, version: [2,2204,13]}) 
    chika.multi = true
    chika.nopref = false
    chika.prefa = 'anjing'
    console.log(color('Connected....'))
    store.bind(chika.ev)
    chika.ev.on('messages.upsert', async m => {
    	if (!m.messages) return
        const msg = m.messages[0]
        require('./message/chika')(chika, msg, m, ind, setting)
    })

    chika.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            console.log(ChikaLog('connection closed, try to restart'))
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut 
            ? start()
            : console.log(ChikaLog('Wa web terlogout.'))
        }
    })

    chika.ev.on('creds.update', () => saveState)

    return chika
}

start()
.catch(err => console.log(err))
