const url =  'http://localhost:5000';

async function sendRequest(url, option, dtoIn) {
    const savedToken = localStorage.getItem('token');
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
        updatePicture: async(dtoIn) => {
            return await sendRequest(url, 'userSettings/updatePicture', dtoIn);

        },
        updateName: async(dtoIn) => {
            return await sendRequest(url, 'userSettings/updateName', dtoIn);

        },
        updatePassword: async(dtoIn) => {
            return await sendRequest(url, 'userSettings/updatePassword', dtoIn);

        },
        deleteAccount: async(dtoIn) => {
            return await sendRequest(url, 'userSettings/deleteAccount', dtoIn);

        },
        updateRole: async(dtoIn) => {
            return await sendRequest(url, 'userSettings/updateRole', dtoIn);

        }

    }
}

export default fetchHelper;