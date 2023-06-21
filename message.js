const express = require('express');
const axios = require('axios');
const cors = require ('cors');
const moment = require('moment');
const { parseISO, format } = require('date-fns');
const app = express();
app.use(cors());
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
// Convertir les données
function convertirEnHL7(patientData, rencontreData, praticienData) {
  const {
    id,
    ipp,
    lastName,
    firstName,
    birthDate,
    communication,
    address,
    phoneNumber,
    gender,
    deceasedDateTime,
    maritalStatus,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactAddress,
    relationship
  } = patientData;
  const parsedBirthDate = parseISO(birthDate);
  const mshSegment = `MSH|^~\\&|SENDING_APPLICATION|SENDING_FACILITY|RECEIVING_APLICATION|RECEIVING_FACILITY|${getDateHL7()}|${getSequenceNumber()}|ADT^A04^ADT_A01|${getMessageControlID()}|P^T|2.5`;
  const evnSegment = `EVN||${getEventDateTime()}`;
  const pidSegment = `PID|1|${id}|${ipp}||${lastName}^${firstName}||${convertToHL7DateFormat(birthDate)}|${gender}|||${address}||${phoneNumber}||${communication}|${maritalStatus}|||||||||||||${convertToHL7DateFormat(deceasedDateTime)}`;
  const nk1Segment = `NK1|1|${emergencyContactName}|${relationship}|${emergencyContactAddress}|${emergencyContactPhone}`;
  let hl7String = `${mshSegment}\n${evnSegment}\n${pidSegment}\n${nk1Segment}`;

  if (rencontreData) {
    const pv1Segment = getPV1Segment(rencontreData, praticienData, patientData);
    hl7String += `\n${pv1Segment}`;
  }

  return hl7String;
}

// Récupération de données
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
       // console.log (patientData);
       // console.log (rencontreData);
        const praticienId = rencontreData.praticienId;
        const praticienURL = `http://localhost:3000/praticiens/${praticienId}`;
        const praticienResponse = await axios.get(praticienURL);

        if (praticienResponse.status === 200) {
          const praticienData = praticienResponse.data;
         // console.log (praticienData);
          const messageHL7 = convertirEnHL7(patientData, rencontreData, praticienData);
          //console.log (messageHL7);
          // Transformation du message hl7
          const segments = messageHL7.split('\n');
          const resultObj = {};
         

          segments.forEach(segment => {
            const fields = segment.split('|');
            const segmentName = fields[0];

            switch (segmentName) {
              case 'MSH':
                const app = fields[2];
                const facility = fields[4];
                const msgTime = moment(fields[6], 'YYYYMMDDHHmmss').format('MMMM D, YYYY HH:mm:ss');
                const controlID = fields[9];
                const type = fields[8];
                const version = fields[11];

                resultObj['MESSAGE HEADER'] = {
                  'App': app,
                  'Facility': facility,
                  'msgTime': msgTime,
                  'controlID': controlID,
                  'type': type,
                  'version': version
                };
                break;
             
              case 'PID':
                const id = fields[2];
                const ipp = fields[3];
                const lastName = fields[5].split('^')[0];
                const firstName = fields[5].split('^')[1];
                const birthDate = moment(fields[7], 'YYYYMMDD').format('MMMM D, YYYY');
                const gender = fields[8];
                const address = fields[11];
                const phoneNumber = fields[13];
                const communication = fields[15];
                const maritalStatus = fields[16];

                resultObj['PATIENT INFORMATION'] = {
                  'ID': id,
                  'Ipp': ipp,
                  'firstName': firstName,
                  'lastName': lastName,
                  'birthDate': birthDate,
                  'gender': gender,
                  'address': address,
                  'phoneNumber': phoneNumber,
                  'communication': communication,
                  'maritalStatus': maritalStatus
                };
                break;
                case 'NK1':
                 
                  const emergencyContactName = fields [2];
                  const relationship = fields [3];
                  const emergencyContactAddress = fields [4];
                  const emergencyContactPhone = fields [5];
                resultObj['NEXT OF KIN'] = {
                  'emergencyContactName': emergencyContactName,
                  'relationShip': relationship,
                  'emergencyContactAddress': emergencyContactAddress,
                  'emergencyContactPhone ':emergencyContactPhone,
                };
                break;
                case 'PV1':
                  const patientClass = fields[2];
                  const practitionerId = fields[7].split('^')[0];
                  const familyName = fields[7].split('^')[1];
                  const givenName = fields[7].split('^')[2];
                  const admitDate = moment(fields[44], 'YYYYMMDD').format('MMMM D, YYYY');
                  const dischargeDate = moment(fields[45], 'YYYYMMDD').format('MMMM D, YYYY');
          
                  resultObj['VISIT INFORMATION'] = {
                    'PatientClass': patientClass,
                    'PractitionerID': practitionerId,
                    'familyName': familyName,
                    'givenName': givenName,
                    'admitDate': admitDate,
                    'dischargeDate': dischargeDate
                  };
                  break;
          
            
            }
          });

          const result = {
            'message HL7': 
            messageHL7,
            'Données Json': 
            resultObj,
        
          };
         console.log(result)
          res.send(result);
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