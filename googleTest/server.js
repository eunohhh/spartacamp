const express = require('express');
const path = require('path');
const googleApis = require('googleapis');
const googleSheet = require('google-spreadsheet');
const credential = require('./sparta_credential.json');
const cors = require('cors');
const app = express();

app.use(cors());  // 모든 도메인에 대해 CORS를 허용합니다.

const SHEET_ID = '11NbvKMfHni_lhu9S7HEM-CpibOdpW6upH7hf6Ri2ALI';

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
})

app.get('/data', async (req, res) => {

    // 구글 시트 조회하는 로직
    const getGoogleSheet = async () => {

        const authorize = new googleApis.google.auth.JWT(credential.client_email, null, credential.private_key, [
            'https://www.googleapis.com/auth/spreadsheets',
        ]);

        const doc = new googleSheet.GoogleSpreadsheet(SHEET_ID, authorize);
        // 구글 인증이 필요하다.
        await doc.loadInfo();
        return doc;
    }

    const fetchGoogleSheetRows = async (sheetId) => {
        const googleSheet = await getGoogleSheet();
        const sheetsByIdElement = googleSheet.sheetsById[sheetId];
        const rows = await sheetsByIdElement.getRows();

        const mapped = rows.map(e => e._rawData);
        return mapped;
    }

    const result = await fetchGoogleSheetRows(0);

    console.log(result)

	// res.sendFile(__dirname + '/index.html');
    res.json(result)
});

app.listen(3000, () => console.log('3000 에서 서버 실행중'));