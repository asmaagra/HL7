const faker = require('faker');
faker.locale = 'fr';
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function generateData() {
  try {
    // Génération de données pour la table Organisation
    const organisationPromises = Array.from({ length: 2 }).map(async () => {
      const organisation = await prisma.organisation.create({
        data: {
          name: faker.company.companyName(),
          description: faker.lorem.sentence(),
        },
      });
      return organisation;
    });

    // Génération de données pour la table Location
    const locationPromises = Array.from({ length: 5 }).map(async () => {
      const ServiceName = [
        'Urgence',
        'Chirurgie',
        'Pédiatrie',
        'Oncologie',
        'Psychiatrie',
        'Cardiologie',
        'Gynécologie',
        'Médecine générale',
        
      ];
      const organisation = await faker.random.arrayElement(await Promise.all(organisationPromises));
      const location = await prisma.location.create({
        
        data: {
          name: faker.random.arrayElement(ServiceName),
          address: faker.address.streetAddress(),
          organisation: {
            connect: { id: organisation.id },
          },
        },
      });
      return location;
    });
    function generateMoroccanCIN() {
        const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
      
        const cin = `${getRandomNumber(10, 99)}${getRandomNumber(10, 99)}${getRandomNumber(10, 99)}${getRandomNumber(1, 9)}${getRandomNumber(0, 9)}`;
      
        return cin;
      }
   // Génération de données pour la table Patient
    const patientPromises = Array.from({ length: 10 }).map(async () => {
      const cin = generateMoroccanCIN();
      const patient = await prisma.patient.create({
        data: {
          ipp: faker.datatype.uuid().substr(0, 10),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          cin: cin,
          photo: faker.image.avatar().substring(0,50),
          communication: faker.random.arrayElement(['français', 'anglais', 'arabe']),
          address: faker.address.streetAddress(),
          email: faker.internet.email(),
          birthDate: faker.date.past(),
          gender: faker.random.arrayElement(['M','F']),
          deceasedBoolean: faker.datatype.boolean(),
          deceasedDateTime: faker.date.past(),
          maritalStatus: faker.random.arrayElement(['A','D', 'M', 'S', 'W']),
          emergencyContactName: faker.name.findName(),
          emergencyContactPhone: faker.phone.phoneNumber(),
          emergencyContactAddress: faker.address.streetAddress(),
          relationship : faker.random.arrayElement(['FTH', 'MTH', 'SON', 'DAU', 'SIS', 'BRO', 'SPO']),
          patientClass: faker.random.arrayElement(['I', 'O', 'E', 'R', 'B']),
        }
      });
      return patient;
    });


    // Génération de données pour la table Praticien
    const praticienPromises = Array.from({ length: 10 }).map(async () => {
      const careTeam = await prisma.careTeam.create({
        data: {
          name: faker.company.companyName(),
        },
      });
      const medicalJobTitles = [
        'Médecin',
        'Dentiste',
        'Infirmier',
        'Pharmacien',
        'assistant médical',
        'radiographe',
        
      ];
      const praticien = await prisma.praticien.create({
        data: {
          role: faker.random.arrayElement(medicalJobTitles),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          email: faker.internet.email(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          careTeam: {
            connect: { id: careTeam.id },
          },
        },
      });
      return praticien;
    });

    // Génération de données pour la table Rencontre
    const rencontrePromises = patientPromises.map(async (patientPromise) => {
      const patient = await patientPromise;
      const praticien = await faker.random.arrayElement(await Promise.all(praticienPromises));
      const rencontre = await prisma.rencontre.create({
        data: {
          startDate: faker.date.past(),
          EndDate: faker.date.recent(),
          description: faker.lorem.sentence(5),
          patient: {
            connect: { id: patient.id },
          },
          praticien: {
            connect: { id: praticien.id },
          },
        }, 
      });
      return rencontre;
    });

    // Génération de données pour la table Appointment
    const appointmentPromises = patientPromises.map(async (patientPromise) => {
      const patient = await patientPromise;
      const praticien = await faker.random.arrayElement(await Promise.all(praticienPromises));
      const location = await faker.random.arrayElement(await Promise.all(locationPromises));
      const appointment = await prisma.appointment.create({
        data: {
          date: faker.date.future(),
          status: faker.random.arrayElement(['en attente', 'confirmer', 'annuler']),
          description: faker.lorem.sentence(),
          patient: {
            connect: { id: patient.id },
          },
          praticien: {
            connect: { id: praticien.id },
          },
          location: {
            connect: { id: location.id },
          },
        },
      });
      return appointment;
    });
    
    // Génération de données pour la table PraticienRole
const praticienRolePromises = Array.from({ length: 10 }).map(async () => {
    const praticien = await faker.random.arrayElement(await Promise.all(praticienPromises));
    const organisation = await faker.random.arrayElement(await Promise.all(organisationPromises));
    const location = await faker.random.arrayElement(await Promise.all(locationPromises));
    const praticienRole = await prisma.praticienRole.create({
      data: {
        name: faker.name.jobTitle(),
        description: faker.lorem.sentence(),
        specialty: faker.lorem.words(),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        active: faker.datatype.boolean(),
        praticien: {
          connect: { id: praticien.id},
        },
        locations: {
          connect: { id: location.id},
        },
        organisation: {
          connect: { id: organisation.id},
        },
      },
    });
    return praticienRole;
  });
  
  // Génération de données pour la table Device
  const devicePromises = Array.from({ length: 10 }).map(async () => {
    const organisation = await faker.random.arrayElement(await Promise.all(organisationPromises));
    const patient = await faker.random.arrayElement(await Promise.all(patientPromises));
    const device = await prisma.device.create({
      data: {
        type: faker.random.word(),
        manufacturer: faker.company.companyName(),
        model: faker.lorem.word(),
        patient: {
            connect: { id: patient.id },
          },
        organisation: {
            connect: { id: organisation.id},
          },
      },
    });
    return device;
  });
  
  // Génération de données pour la table HealthcareService
  const healthcareServicePromises = Array.from({ length: 10 }).map(async () => {
    const organisation = await faker.random.arrayElement(await Promise.all(organisationPromises));
    const location = await faker.random.arrayElement(await Promise.all(locationPromises));
    const healthcareService = await prisma.healthcareService.create({
      data: {
        name: faker.company.companyName(),
        description: faker.lorem.sentence(),
        contact: faker.phone.phoneNumber(),
        location: {
            connect: { id: location.id },
          },
        organization: {
            connect: { id: organisation.id},
          },
      },
    });
    return healthcareService;
  });
  
    await Promise.all([
      ...patientPromises,
      
      ...praticienPromises,
      ...rencontrePromises,
      ...appointmentPromises,
      ...locationPromises,
      ...organisationPromises,
      ...healthcareServicePromises,
      ...devicePromises,
      ...praticienRolePromises,

    ]);

    console.log('Données générées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la génération des données :', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateData();
// CRUD
const app = express();
app.use(express.json());

    
  // Patient 
  // Récupération
app.get('/patients', async (req, res) => {
    try {
      const patients = await prisma.patient.findMany();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des patients.' });
    }
  });
  // Création
  app.post('/patients', async (req, res) => {
    const { ipp, firstName, lastName, phoneNumber, cin, photo,  communication, address, email, birthDate, gender,deceasedBoolean, deceasedDateTime, maritalStatus, emergencyContactName, emergencyContactPhone, emergencyContactAddress, relationship } = req.body;
    try {
      const patient = await prisma.patient.create({
        data: {
          ipp, 
          firstName, 
          lastName, 
          phoneNumber, 
          cin, 
          photo,  
          communication, 
          address, 
          email, 
          birthDate, 
          gender,
          deceasedBoolean, 
          deceasedDateTime, 
          maritalStatus, 
          emergencyContactName, 
          emergencyContactPhone,
          emergencyContactAddress,
          relationship
        },
      });
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la création du patient.' });
    }
  });
   // Récupération par ID
   app.get('/patients/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const patient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
      if (patient) {
        res.json(patient);
      } else {
        res.status(404).json({ error: 'Patient non trouvé.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du patient.' });
    }
  });
  // Mise à jour
  app.put('/patients/:id', async (req, res) => {
    const { id } = req.params;
    const {  ipp, firstName, lastName, phoneNumber, cin, photo,  communication, address, email, birthDate, gender,deceasedBoolean, deceasedDateTime, maritalStatus, emergencyContactName, emergencyContactPhone, emergencyContactAddress, relationship } = req.body;
    try {
      const updatedPatient = await prisma.patient.update({
        where: { id: parseInt(id) },
        data: {
          ipp, 
          firstName, 
          lastName, 
          phoneNumber, 
          cin, 
          photo,  
          communication, 
          address, 
          email, 
          birthDate, 
          gender,
          deceasedBoolean, 
          deceasedDateTime, 
          maritalStatus, 
          emergencyContactName, 
          emergencyContactPhone,
          emergencyContactAddress,
          relationship
        },
      });
      res.json(updatedPatient);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du patient.' });
    }
  });
  // Suppression
  app.delete('/patients/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.patient.delete({ where: { id: parseInt(id) } });
      res.json({ message: 'Patient supprimé avec succès.' });
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression du patient.' });
    }
  });
  
// Praticien
// Récupération
app.get('/praticiens', async (req, res) => {
    try {
      const praticiens = await prisma.praticien.findMany();
      res.json(praticiens);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des praticiens.' });
    }
  });
  
  // Création
  app.post('/praticiens', async (req, res) => {
    const { role, firstName,lastName,phoneNumber, email, createdAt,updatedAt, } = req.body;
    try {
      const praticien = await prisma.praticien.create({
        data: {
          role,
          firstName,
          lastName,
          phoneNumber, 
          email, 
          createdAt,
          updatedAt,
          
        },
      });
      res.json(praticien);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la création du praticien.' });
    }
  });
  // Récupération per Id
  app.get('/praticiens/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const praticien = await prisma.praticien.findUnique({ where: { id: parseInt(id) } });
      if (praticien) {
        res.json(praticien);
      } else {
        res.status(404).json({ error: 'Praticien non trouvé.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du praticien.' });
    }
  });
  // Mise à jour
  app.put('/praticiens/:id', async (req, res) => {
    const { id } = req.params;
    const { role,  firstName,lastName,phoneNumber, email, createdAt,updatedAt, } = req.body;
    try {
      const updatedPraticien = await prisma.praticien.update({
        where: { id: parseInt(id) },
        data: {
          role,
          firstName,
          lastName,
          phoneNumber, 
          email, 
          createdAt,
          updatedAt,
        },
      });
      res.json(updatedPraticien);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du praticien.' });
    }
  });
  // Suppression
  app.delete('/praticiens/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.praticien.delete({ where: { id: parseInt(id) } });
      res.json({ message: 'Praticien supprimé avec succès.' });
    } catch (error) {
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression du praticien.' });
    }
  });
// Rencontre 
// Récypération
app.get('/rencontres', async (req, res) => {
    try {
      const rencontres = await prisma.rencontre.findMany();
      res.json(rencontres);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des rencontres." });
    }
  });
  // Création
  app.post('/rencontres', async (req, res) => {
    const { date, description, patientId, praticienId } = req.body;
    try {
      const rencontre = await prisma.rencontre.create({
        data: {
          date,
          description,
          patient: { connect: { id: patientId } },
          praticien: { connect: { id: praticienId } },
        },
      });
      res.json(rencontre);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création de la rencontre." });
    }
  });
  
  // Récupération par ID
  app.get('/rencontres/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const rencontre = await prisma.rencontre.findUnique({ where: { id: parseInt(id) } });
      if (rencontre) {
        res.json(rencontre);
      } else {
        res.status(404).json({ error: "Rencontre non trouvée." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération de la rencontre." });
    }
  });
  
  // Mise à jour 
  app.put('/rencontres/:id', async (req, res) => {
    const { id } = req.params;
    const { date, description, patientId, praticienId } = req.body;
    try {
      const updatedRencontre = await prisma.rencontre.update({
        where: { id: parseInt(id) },
        data: {
          date,
          description,
          patient: { connect: { id: patientId } },
          praticien: { connect: { id: praticienId } },
        },
      });
      res.json(updatedRencontre);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour de la rencontre." });
    }
  });
  
  // Suppression
  app.delete('/rencontres/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.rencontre.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Rencontre supprimée avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression de la rencontre." });
    }
  });
// rendez-vous
// Récupération
app.get('/appointments', async (req, res) => {
    try {
      const appointments = await prisma.appointment.findMany();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des rendez-vous." });
    }
  });
  
  // Création
  app.post('/appointments', async (req, res) => {
    const { date, status, description, patientId, praticienId, locationId } = req.body;
    try {
      const appointment = await prisma.appointment.create({
        data: {
          date,
          status,
          description,
          patient: { connect: { id: patientId } },
          praticien: { connect: { id: praticienId } },
          location: locationId ? { connect: { id: locationId } } : undefined,
        },
      });
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création du rendez-vous." });
    }
  });
  
  // Récupération par ID
  app.get('/appointments/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
      if (appointment) {
        res.json(appointment);
      } else {
        res.status(404).json({ error: "Rendez-vous non trouvé." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération du rendez-vous." });
    }
  });
  
  // Mise à jour
  app.put('/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const { date, status, description, patientId, praticienId, locationId } = req.body;
    try {
      const updatedAppointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: {
          date,
          status,
          description,
          patient: { connect: { id: patientId } },
          praticien: { connect: { id: praticienId } },
          location: locationId ? { connect: { id: locationId } } : undefined,
        },
      });
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour du rendez-vous." });
    }
  });
  
  // Suppression
  app.delete('/appointments/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.appointment.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Rendez-vous supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression du rendez-vous." });
    }
  });
// location
// Récupération
app.get('/locations', async (req, res) => {
    try {
      const locations = await prisma.location.findMany();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des localisations." });
    }
  });
  
  // Création
  app.post('/locations', async (req, res) => {
    const { name, address, city, organisationId } = req.body;
    try {
      const location = await prisma.location.create({
        data: {
          name,
          address,
          city,
          organisation: { connect: { id: organisationId } },
        },
      });
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création de la localisation." });
    }
  });
  
  // Récupération par ID
  app.get('/locations/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const location = await prisma.location.findUnique({ where: { id: parseInt(id) } });
      if (location) {
        res.json(location);
      } else {
        res.status(404).json({ error: "Localisation non trouvée." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération de la localisation." });
    }
  });
  
  // Mise à jour
  app.put('/locations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address, city, organisationId } = req.body;
    try {
      const updatedLocation = await prisma.location.update({
        where: { id: parseInt(id) },
        data: {
          name,
          address,
          city,
          organisation: { connect: { id: organisationId } },
        },
      });
      res.json(updatedLocation);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour de la localisation." });
    }
  });
  
  // Suppression
  app.delete('/locations/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.location.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Localisation supprimée avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression de la localisation." });
    }
  });
// Organisation
// Récupération
app.get('/organisations', async (req, res) => {
    try {
      const organisations = await prisma.organisation.findMany();
      res.json(organisations);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des organisations." });
    }
  });
  
  // Création
  app.post('/organisations', async (req, res) => {
    const { name, description } = req.body;
    try {
      const organisation = await prisma.organisation.create({
        data: {
          name,
          description,
        },
      });
      res.json(organisation);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création de l'organisation." });
    }
  });
  
  // Récupération par ID
  app.get('/organisations/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const organisation = await prisma.organisation.findUnique({ where: { id: parseInt(id) } });
      if (organisation) {
        res.json(organisation);
      } else {
        res.status(404).json({ error: "Organisation non trouvée." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération de l'organisation." });
    }
  });
  
  //Mise à jour
  app.put('/organisations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      const updatedOrganisation = await prisma.organisation.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
        },
      });
      res.json(updatedOrganisation);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour de l'organisation." });
    }
  });
  
  // Suppression
  app.delete('/organisations/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.organisation.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Organisation supprimée avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression de l'organisation." });
    }
  });
// PraticienRole
// Récupération
app.get('/praticien-roles', async (req, res) => {
    try {
      const praticienRoles = await prisma.praticienRole.findMany();
      res.json(praticienRoles);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des rôles de praticien." });
    }
  });
  
  // Création
  app.post('/praticien-roles', async (req, res) => {
    const { name, description, specialty, startDate, endDate, active, praticienId, organisationId } = req.body;
    try {
      const praticienRole = await prisma.praticienRole.create({
        data: {
          name,
          description,
          specialty,
          startDate,
          endDate,
          active,
          praticienId,
          organisationId,
        },
      });
      res.json(praticienRole);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création du rôle de praticien." });
    }
  });
  
  // Récupération par ID
  app.get('/praticien-roles/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const praticienRole = await prisma.praticienRole.findUnique({ where: { id: parseInt(id) } });
      if (praticienRole) {
        res.json(praticienRole);
      } else {
        res.status(404).json({ error: "Rôle de praticien non trouvé." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération du rôle de praticien." });
    }
  });
  
  // Mise à jour
  app.put('/praticien-roles/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, specialty, startDate, endDate, active, praticienId, organisationId } = req.body;
    try {
      const updatedPraticienRole = await prisma.praticienRole.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          specialty,
          startDate,
          endDate,
          active,
          praticienId,
          organisationId,
        },
      });
      res.json(updatedPraticienRole);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour du rôle de praticien." });
    }
  });
  
  // Suppression
  app.delete('/praticien-roles/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.praticienRole.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Rôle de praticien supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression du rôle de praticien." });
    }
  });
  // Appareil
  // Récupération
  app.get('/devices', async (req, res) => {
    try {
      const devices = await prisma.device.findMany();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des appareils." });
    }
  });
  
  // Création
  app.post('/devices', async (req, res) => {
    const { type, manufacturer, model, patientId, organisationId } = req.body;
    try {
      const device = await prisma.device.create({
        data: {
          type,
          manufacturer,
          model,
          patientId,
          organisationId,
        },
      });
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création d'appareil." });
    }
  });
  
  // Récupération par ID
  app.get('/devices/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const device = await prisma.device.findUnique({ where: { id: parseInt(id) } });
      if (device) {
        res.json(device);
      } else {
        res.status(404).json({ error: "Appareil non trouvé." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération d'appareil." });
    }
  });
  
  // Mise à jour
  app.put('/devices/:id', async (req, res) => {
    const { id } = req.params;
    const { type, manufacturer, model, patientId, organisationId } = req.body;
    try {
      const updatedDevice = await prisma.device.update({
        where: { id: parseInt(id) },
        data: {
          type,
          manufacturer,
          model,
          patientId,
          organisationId,
        },
      });
      res.json(updatedDevice);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour d'appareil." });
    }
  });
  
  // Suppression
  app.delete('/devices/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.device.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Appareil supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression d'appareil." });
    }
  });

// service de santé 
// Récupération
app.get('/healthcareservices', async (req, res) => {
    try {
      const healthcareServices = await prisma.healthcareService.findMany();
      res.json(healthcareServices);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des services de santé." });
    }
  });
  
  // Création
  app.post('/healthcareservices', async (req, res) => {
    const { name, description, contact, locationId, organisationId } = req.body;
    try {
      const healthcareService = await prisma.healthcareService.create({
        data: {
          name,
          description,
          contact,
          locationId,
          organisationId,
        },
      });
      res.json(healthcareService);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création du service de santé." });
    }
  });
  
  //Récupération par ID
  app.get('/healthcareservices/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const healthcareService = await prisma.healthcareService.findUnique({ where: { id: parseInt(id) } });
      if (healthcareService) {
        res.json(healthcareService);
      } else {
        res.status(404).json({ error: "Service de santé non trouvé." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération du service de santé." });
    }
  });
  
  // Mise à jour
  app.put('/healthcareservices/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, contact, locationId, organisationId } = req.body;
    try {
      const updatedHealthcareService = await prisma.healthcareService.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          contact,
          locationId,
          organisationId,
        },
      });
      res.json(updatedHealthcareService);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour du service de santé." });
    }
  });
  
  // Suppression
  app.delete('/healthcareservices/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.healthcareService.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Service de santé supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression du service de santé." });
    }
  });
// équipe de soins
// Récupération
app.get('/careteams', async (req, res) => {
    try {
      const careTeams = await prisma.careTeam.findMany();
      res.json(careTeams);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des équipes de soins." });
    }
  });
  // Création
  app.post('/careteams', async (req, res) => {
    const { name, healthCareServiceId } = req.body;
    try {
      const careTeam = await prisma.careTeam.create({
        data: {
          name,
          healthCareServiceId,
        },
      });
      res.json(careTeam);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la création de l'équipe de soins." });
    }
  });
  // Récupération par ID
  app.get('/careteams/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const careTeam = await prisma.careTeam.findUnique({ where: { id: parseInt(id) } });
      if (careTeam) {
        res.json(careTeam);
      } else {
        res.status(404).json({ error: "Équipe de soins non trouvée." });
      }
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la récupération de l'équipe de soins." });
    }
  });
  
  // Mise à jour
  app.put('/careteams/:id', async (req, res) => {
    const { id } = req.params;
    const { name, healthCareServiceId } = req.body;
    try {
      const updatedCareTeam = await prisma.careTeam.update({
        where: { id: parseInt(id) },
        data: {
          name,
          healthCareServiceId,
        },
      });
      res.json(updatedCareTeam);
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour de l'équipe de soins." });
    }
  });
  
  // Suppression
  app.delete('/careteams/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.careTeam.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Équipe de soins supprimée avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Une erreur s'est produite lors de la suppression de l'équipe de soins." });
    }
  });
  app.listen(3000, () => {
    console.log('API démarrée sur le port 3000.');
  });  
