module.exports = () => {
    // Perform a search and respond with results.
    bot.dialog('scibot:search', [
        async (session, args) => {
            session.sendTyping();
            let userText = session.message.text.toLowerCase();
            azureSearchQuery(session, { query: cleanQueryString(userText, false) });
        }
    ]).triggerAction({
        matches: ['Search', 'None']
    });
}