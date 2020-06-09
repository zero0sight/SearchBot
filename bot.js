const Telegraf = require("telegraf");
const axios = require('axios');
const bot = new Telegraf("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
const apikey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

//https://pixabay.com/api/?key=<apikey>&q=<search>

//ctx.answerInlineQuery(results, [extra]);
//bot.telegram.answerInlineQuery(inlineQueryId, results, [extra]);

//https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=<query>&limit=50

bot.command(['start', 'help'], ctx => {
    let message = `
Welcome to Search Bot.
Use the inline mode below
@sea17bot p <search image>
@sea17bot w <search wiki>
`;
    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Search Pixabay Image', switch_inline_query_current_chat: 'p '}
                ],
                [
                    {text: 'Search Wiki', switch_inline_query_current_chat: 'w '}
                ]
            ]
        }
    });
});

bot.inlineQuery(['start', 'help'], ctx => {
    let message = `
Welcome to Search Bot.
Use the inline mode below
@sea17bot p <search image>
@sea17bot w <search wiki>
    `;
    let results = [
        {
            type: 'article',
            id: '1',
            title: 'Help Refrence',
            input_message_content: {
                message_text: message
            },
            description: 'Sends help message one how to use the bot',
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'Search Pixabay Image', switch_inline_query_current_chat: 'p '}
                    ],
                    [
                        {text: 'Search Wiki', switch_inline_query_current_chat: 'w '}
                    ]
                ]
            }
        }
    ];
    ctx.answerInlineQuery(results);
});

bot.inlineQuery(/p\s.+/, async ctx => {

    let input = ctx.inlineQuery.query.split(' ');
    input.shift();
    let query = input.join(' ');

    let res = await axios.get(`https://pixabay.com/api/?key=${apikey}&q=${query}`);
    let data = res.data.hits;
        
    let results = data.map((item, index) =>{
        return {
            type: 'photo',
            id: String(index),
            photo_url: item.webformatURL,
            thumb_url: item.previewURL,
            photo_width: item.webformatWidth,
            photo_height: item.webformatHeight,
            caption: `[Source](${item.webformatURL})\n[Large Image](${item.largeImageURL})`,
            parse_mode: "Markdown"
        }
    });
    ctx.answerInlineQuery(results);
});

bot.inlineQuery(/w\s.+/, async ctx => {

    let input = ctx.inlineQuery.query.split(' ');
    input.shift();
    let query = input.join(' ');
    //let query = ctx.inlineQuery.query;
    let res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=50`);
    //console.log(res.data);
    let data = res.data;
    let allTitles = data[1];
    let allLinks = data[3];

    if (allTitles == undefined){return;} //handle some errors

    let results = allTitles.map((item, index) => {
        return {
            type: 'article',
            id: String(index),
            title: item,
            input_message_content: {
                message_text: `${item}\n${allLinks[index]}`
            },
            description: allLinks[index],
            reply_markup: {
                inline_keyboard:[
                    [
                        {text: `Share ${item}`, switch_inline_query: `${item}`}
                    ]
                ]
            }
        }
    });

    ctx.answerInlineQuery(results);
});

bot.launch();