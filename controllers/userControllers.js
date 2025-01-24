const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../controllers/authControllers');
const prisma = new PrismaClient();



// ============================
//          EVENTS
// ============================

exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.events.findMany();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data event" });
  }
};

exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.events.findUnique({ where: { id: Number(id) } });
    event ? res.status(200).json(event) : res.status(404).json({ error: "Event tidak ditemukan" });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil detail event" });
  }
};

exports.createEvent = async (req, res) => {
  const { name, description, date, location, capacity } = req.body;
  try {
    const event = await prisma.events.create({
      data: { name, description, date: new Date(date), location, capacity },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan event" });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, location, capacity } = req.body;
  try {
    const event = await prisma.events.update({
      where: { id: Number(id) },
      data: { name, description, date: new Date(date), location, capacity },
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui event" });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.events.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus event" });
  }
};

// ============================
//       PARTICIPANTS
// ============================

exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await prisma.participants.findMany();
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data peserta" });
  }
};

exports.getParticipantById = async (req, res) => {
  const { id } = req.params;
  try {
    const participant = await prisma.participants.findUnique({ where: { id: Number(id) } });
    participant ? res.status(200).json(participant) : res.status(404).json({ error: "Peserta tidak ditemukan" });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil detail peserta" });
  }
};



exports.createParticipant = async (req, res) => {
  const { name, email, phone_number, password } = req.body;
  try {
    // Validasi input
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password harus minimal 6 karakter." });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

    const participant = await prisma.participants.create({
      data: { 
        name, 
        email, 
        phone_number, 
        password: hashedPassword 
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan peserta" });
  }
};

exports.updateParticipant = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number } = req.body;
  try {
    const participant = await prisma.participants.update({
      where: { id: Number(id) },
      data: { name, email, phone_number },
    });
    res.status(200).json(participant);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui peserta" });
  }
};

exports.deleteParticipant = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.participants.delete({ where: { id: Number(id) } });
    res.status(204).json({ message: "Akun Anda berhasil logout !" })
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus peserta" });
  }
};

// ============================
//       REGISTRATIONS
// ============================

exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.registrations.findMany({
      include: { events: true, participants: true },
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data registrasi" });
  }
};

exports.getRegistrationById = async (req, res) => {
  const { id } = req.params;
  try {
    const registration = await prisma.registrations.findUnique({
      where: { id: Number(id) },
      include: { events: true, participants: true },
    });
    registration
      ? res.status(200).json(registration)
      : res.status(404).json({ error: "Registrasi tidak ditemukan" });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil detail registrasi" });
  }
};

exports.createRegistration = async (req, res) => {
  const { event_id, participant_id } = req.body;
  try {
    const registration = await prisma.registrations.create({
      data: { event_id, participant_id },
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan registrasi" });
  }
};

exports.deleteRegistration = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.registrations.delete({ where: { id: Number(id) } });
    res.status(204).json({message:"berhasil menghapus"});
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus registrasi" });
  }
};

// ============================
//     LOGIN PARTICIPANT
// ============================

exports.loginParticipant = async (req, res) => {
  const { email, password } = req.body;

  try {
    const participant = await prisma.participants.findUnique({ where: { email } });

    if (!participant) {
      return res.status(404).json({ error: 'Peserta tidak ditemukan.' });
    }

    const isPasswordValid = await bcrypt.compare(password, participant.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

 
    const userPayload = { id: participant.id, email: participant.email };
    const token = generateToken(userPayload);

    res.status(200).json({ message: 'Login berhasil.', token });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memproses permintaan.' });
  }
};
// ============================
//    ADDITIONAL ENDPOINTS
// ============================

exports.getEventRegistrations = async (req, res) => {
  const { eventId } = req.params;
  try {
    const registrations = await prisma.registrations.findMany({
      where: { event_id: Number(eventId) },
      include: { participants: true },
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil registrasi event" });
  }
};

exports.getParticipantRegistrations = async (req, res) => {
  const { participantId } = req.params;
  try {
    const registrations = await prisma.registrations.findMany({
      where: { participant_id: Number(participantId) },
      include: { events: true },
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil registrasi peserta" });
  }
};

exports.updateEventCapacity = async (req, res) => {
  const { id } = req.params;
  const { capacity } = req.body;
  try {
    const event = await prisma.events.update({
      where: { id: Number(id) },
      data: { capacity },
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui kapasitas event" });
  }
};

exports.getRegistrationsByDate = async (req, res) => {
  const { date } = req.query;
  try {
    const registrations = await prisma.registrations.findMany({
      where: {
        registration_date: {
          gte: new Date(date),
        },
      },
      include: { events: true, participants: true },
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil registrasi berdasarkan tanggal" });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await prisma.events.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil event yang akan datang" });
  }
};
