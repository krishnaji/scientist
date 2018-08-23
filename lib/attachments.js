const builder = require('botbuilder');

const buildResultsMessageWithAttachments = (session, resultsArray) => {
    const attachments = [];

    const message = new builder.Message(session);
    message.attachmentLayout(builder.AttachmentLayout.carousel);

    //Just to be safe, skype and teams have a card limit of 6/10
    let limit = (resultsArray.length > 6) ? 6 : resultsArray.length;

    for (let i = 0; i < limit; i++) {
        const result = resultsArray[i];

        const attachment = {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                body: [
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "size": 2,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": `${result.title}`,
                                        "weight": "bolder",
                                        "size": "large",
                                        "wrap": true,
                                    },
                                    {
                                        "type": "TextBlock",
                                        "text": `${result.body_markdown}`,
                                        "size": "normal",
                                        "horizontalAlignment": "left",
                                        "wrap": true,
                                        "maxLines": 5,
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }

        attachments.push(attachment);
    }

    message.attachments(attachments);
    return message;
};


module.exports = {

    buildResultsMessageWithAttachments
}