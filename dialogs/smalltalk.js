module.exports = () => {
    // Smalltalk… gibberish, babble, etc. Not the programming language :)
    bot.dialog('scibot:smalltalk', [
        async (session) => {
            // Start async tasks
         
            const qnATask = fetchQnA(session.message.text);

            // Wait for tasks to complete
           
            const qnAResponse = await qnATask;

            if (qnAResponse) {
                // Continue with the smalltalk.
                return session.endDialog(qnAResponse);
            } else {
                // Else the user wants to search for clinical trials.
                azureSearchQuery(session, { query: cleanQueryString(session.message.text, false) });
            }
        },
        (session, results) => {
            return session.endDialog("Ok then. Feel free to ask me another question!");
         }
    ]).triggerAction({
        matches: 'SmallTalk'
    });

    const fetchQnA = async (text) => {
        let answer;

        await qnaClient.post({ question: text }, (err, res) => {
            if (err) {
                console.error('Error from callback:', err);
            } else if (res) {
                answer = res;
            }
        });

        return answer;
    }

    
}