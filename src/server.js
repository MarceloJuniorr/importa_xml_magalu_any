import express from 'express';
import {formatDate, getDate, getDatePrior} from './utils.js';
import axios from "axios";
import { allOrders, insertOrder } from './querys.js';
import { config } from './config.js';
import { CronJob } from 'cron';

const { port, storeno, gumgaToken } = config
const { cronFatura } = config.cron



const app = express();
app.use(express.json());
console.log(getDatePrior(config.datePrior));
let controlJob = false


const enviaFaturadas = async (storeno, gumgaToken, date , datePrior) => {
    
    const hubId=4
    const orders = await allOrders(date, hubId, storeno, datePrior)
    const notSend = []
    const send = []
    if ( !orders[0]  ) {
        return console.log('Não existem notas a serem enviadas');
    } 
    
    console.log(orders);
    
    for await (let order of orders ) { 
        
        try {
            let url = `http://api.anymarket.com.br/v2/orders/${order.ordnoweb}/nfe`
            let config = {
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/xml',
                    gumgaToken
                }
            }
            let objectOrder = {
                ordnoweb: order.ordnoweb,
                ordno: order.ordno
            }
            await axios.put(url, order.xml, config)
            .then(async res => {
                send.push(objectOrder)
                console.log(res.status + 'Pedido enviado para anymarket: ' + order.ordno);
                const insert = await insertOrder(order.ordno, order.storeno).catch(err => {console.log(err)});
                console.log(insert);
            }).catch(async err => {
                if (err.response.data.message.includes('O Mercado Livre não permite o envio do XML da nota fiscal para a seguinte combinação de status e substatus do shipment do pedido no Mercado Livre.')) {
                    const insert = await insertOrder(order.ordno, order.storeno).catch(err => {console.log(err)});
                    console.log(insert);
                } else if (err.response.data.message.includes('Este marketplace não suporta fatura de pedidos por XML')) {
                    const insert = await insertOrder(order.ordno, order.storeno).catch(err => {console.log(err)});

                    let url = `http://api.anymarket.com.br/v2/orders/${order.ordnoweb}`
                    let config = {
                        headers:{
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            gumgaToken
                        }
                    }
                    let data = formatDate(order.date)
                   console.log(data);

                    let objectOrder = {
                        
                            "order_id": order.ordnoweb,
                            "status": "INVOICED",
                            "invoice": {
                              "series": order.serie,
                              "number": order.nota,
                              "accessKey": order.nfkey.trim(),
                              "date": `${data}T08:00:00-03:00Z`
                            }
                          
                    }
                    

                    await axios.put(url, objectOrder, config)
                    .then(async res => {
                        send.push(objectOrder)
                        console.log(res.status + 'Pedido enviado para anymarket: ' + order.ordno);
                        const insert = await insertOrder(order.ordno, order.storeno).catch(err => {console.log(err)});
                        console.log(insert);
                    }).catch(async err => {
                        console.log(err.response.data);
                    })

                    console.log(insert);
                } else if (err.response.data.message.includes('Status diferente de pago') || err.response.data.message.includes('Erro ao processar pedido na Shopee') ) {
                    const insert = await insertOrder(order.ordno, order.storeno).catch(err => {console.log(err)});
                    console.log(insert);
                } else {
                    console.log(err.response.data);
                }

                notSend.push(objectOrder)
            });
            
        } catch (error) {
            console.log(error);
        }
        
    }
    
    return { enviados: send,
        naoEnviados: notSend}
        
        
    }
    
    app.post('/fatura', async (req,res) => {
        const {storeno, gumgaToken, date, datePrior} = req.body
        
        if (!storeno || !gumgaToken || !date) {
            return res.status(400).json({message: `Verifique as propriedades obrigatórias(storeno, gumgaToken, date)`})        
        }
        try {
            await enviaFaturadas(storeno, gumgaToken, date, datePrior).then((result) => { return res.status(200).json(result.data)})
        } catch (error) {
            console.log(error)
            return res.status(400).json(error.data) 
        }
        
    })
    
    const job = new CronJob(cronFatura, async () => {
        if (controlJob) {
            return console.log(`Serviço já está em execuçao`);
        } else {
            controlJob = true
        }
        console.log(`Inicializando rotina do cron `);
        let date = getDate()
        let datePrior = getDatePrior(config.datePrior)
        if (!storeno || !gumgaToken ) {
            console.log(`Verifique as propriedades obrigatórias no YML (STORENO, GUMGATOKEN)`);
        } else {
            console.log(`preparando funcao enviaFaturadas`);
            await enviaFaturadas(storeno, gumgaToken, date, datePrior).catch((error) => console.log(error))
        }
        console.log(`Serviço de faturamento encerrado`);
        controlJob = false
    },null, true, 'America/Sao_Paulo')

    app.listen(port, () => {
        console.log(`Funcionando na porta ${port}`)
        job.start()
        console.log(`Cron inicializado`);
    })