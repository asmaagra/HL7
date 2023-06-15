const express = require('express');
const axios = require('axios');
const { parseISO, format } = require('date-fns');

const app = express();

function getSequenceNumber() {
  const sequenceNumber = Math.floor(Math.random() * 1000000) + 1;
  return sequenceNumber.toString();
}

function getMessageControlID() {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substr(2, 3);
  const messageControlID = `MSG${timestamp}${randomString}`;
  return messageControlID.substr(0, 20);
}

function getDateHL7() {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function getEventDateTime() {
  return getDateHL7();
}

function getPV1Segment(rencontreData, praticienData, patientData) {
  const { startDate, EndDate } = rencontreData;
  const { id , firstName, lastName } = praticienData;
  const { patientClass } = patientData;
  
  const convertedStartDate = convertToHL7DateFormat(startDate);
  const convertedEndDate = convertToHL7DateFormat(EndDate);

  const pv1Segment = `PV1|1|${patientClass}|||||${id}^${firstName}^${lastName}|||||||||||||||||||||||||||||||||||||${convertedStartDate}|${convertedEndDate}`;

  return pv1Segment;
}

function convertToHL7DateFormat(dateString) {
  const parsedDate = parseISO(dateString);
  const formattedDate = format(parsedDate, 'yyyyMMdd');
  return formattedDate;
}

function convertirEnHL7(patientData, rencontreData, praticienData) {
  const {
    id,
    ipp,
    lastName,
    firstName,
    birthDate,
    cin,
    photo,
    communication,
    address,
    email,
    phoneNumber,
    gender,
    deceasedBoolean,
    deceasedDateTime,
    maritalStatus,
    emergencyContactName,
    emergencyContactPhone
  } = patientData;
  const parsedBirthDate = parseISO(birthDate);
  const mshSegment = `MSH|^~\\&|SENDING_APPLICATION|SENDING_FACILITY|RECEIVING_APLICATION|RECEIVING_FACILITY|${getDateHL7()}|${getSequenceNumber()}|ADT^A04^ADT_A01|${getMessageControlID()}|P^T|2.5`;
  const evnSegment = `EVN||${getEventDateTime()}`;
  const pidSegment = `PID|1|${id}|${ipp}||${lastName}^${firstName}||${convertToHL7DateFormat(birthDate)}|${gender}|||${address}||${phoneNumber}|||${maritalStatus}|||||||||||||${convertToHL7DateFormat(deceasedDateTime)}`;
  const nk1Segment = `NK1|1|${emergencyContactName}|||${emergencyContactPhone}`;
  let hl7String = `${mshSegment}\n${evnSegment}\n${pidSegment}\n${nk1Segment}`;

  if (rencontreData) {
    const pv1Segment = getPV1Segment(rencontreData, praticienData, patientData);
    hl7String += `\n${pv1Segment}`;
  }

  return hl7String;
}

app.get('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const adminServiceURL = `http://localhost:3000/patients/${id}`;
    const response = await axios.get(adminServiceURL);

    if (response.status === 200) {
      const patientData = response.data;
      const rencontreURL = `http://localhost:3000/rencontres/${id}`;
      const rencontreResponse = await axios.get(rencontreURL);

      if (rencontreResponse.status === 200) {
        const rencontreData = rencontreResponse.data;
        console.log(patientData);
        console.log(rencontreData);

        const praticienId = rencontreData.praticienId;
        const praticienURL = `http://localhost:3000/praticiens/${praticienId}`;
        const praticienResponse = await axios.get(praticienURL);

        if (praticienResponse.status === 200) {
          const praticienData = praticienResponse.data;
          console.log(praticienData);

          const messageHL7 = convertirEnHL7(patientData, rencontreData, praticienData);
          console.log(messageHL7);

          res.json({ patientData, rencontreData, praticienData });
        } else {
          res.status(404).json({ error: "Une erreur s'est produite lors de la récupération des données du praticien." });
        }
      } else {
        res.status(404).json({ error: "Une erreur s'est produite lors de la récupération des données de la rencontre." });
      }
    } else {
      res.status(404).json({ error: "Une erreur s'est produite lors de la récupération des données du patient." });
    }
  } catch (error) {
    res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des données du patient." });
  }
});


app.listen(4000, () => {
  console.log('API HL7 démarrée sur le port 4000.');
});
