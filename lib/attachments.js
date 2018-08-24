const builder = require('botbuilder');

const buildResultsMessageWithAttachments = (session, resultsArray) => {
    const attachments = [];

    const message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);

    //Just to be safe, skype and teams have a card limit of 6/10
    let limit = (resultsArray.length > 6) ? 6 : resultsArray.length;

    for (let i = 0; i < limit; i++) {
        const result = resultsArray[i];
        
        const attachment = new builder.HeroCard(session)
                            .title(`${result.title}`)
                            .text(`${result.body_markdown}`)

        attachments.push(attachment);
    }

    message.attachments(attachments);
    return message;
};


module.exports = {

    buildResultsMessageWithAttachments
}