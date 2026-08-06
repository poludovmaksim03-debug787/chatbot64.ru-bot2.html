const fetch = require('node-fetch');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
         res.status(200).end();
         return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });  
    }

    try {
        const { homeworkText } = req.body;
        const yandexRequestBody = {
            modelUri: 'gpt://${process.env.YANDEX_FOLDER_ID}/yandex-lite/latest',
            completionOptions: {
                stream: false,
                temperature: 0.3,
                maxTokens: "2000"
            },
            messages: [
                {
                    role: "system",
                    text: "Ты профессиональный преподаватель. Твоя задача - внимательно проверять домашнее задание, указать на ошибки, объяснить, как их исправить, и дать конструктивную обратную связь."
                },
                {
                    role: "user",
                    text: 'Проверь следующее домашнее задание: \n\n${homeworkText}'
                }
            ]
        };

        const response = await fetch('https://yandex.net', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Api-Key ${process.env.YANDEX_API_KEY}',
                'x-folder-id': process.env.YANDEX_FOLDER_ID
            },
            body: JSON.stringify(yandexRequestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'Ошибка Yandex API'});
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
    