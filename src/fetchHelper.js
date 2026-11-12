const url =  'http://localhost:5000';

async function sendRequest(url, option, dtoIn) {
    let response = await fetch(`${url}/${option}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(dtoIn)
    });

    const data = await response.json();
    return data;
}

const fetchHelper = {
    userSettings: {
        updateName: async(dtoIn) => {
            return await sendRequest(url, 'userSettings/updateName', dtoIn);

        }
    }
}
