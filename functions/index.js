/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { generarFacturasCuotaPiso } = require('./facturaService');
const { onSchedule } = require('firebase-functions/v2/scheduler');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

// Función programada para generar facturas de cuota de piso el primer día de cada mes
exports.generarFacturasMensuales = onSchedule(
  {
    schedule: '0 0 1 * *',
    timeZone: 'Europe/Madrid',
    retryCount: 3,
    maxRetrySeconds: 60,
    memory: '256MiB',
  },
  async (event) => {
    try {
      await generarFacturasCuotaPiso();
      logger.info('Facturas de cuota de piso generadas correctamente');
      return null;
    } catch (error) {
      logger.error('Error al generar facturas de cuota de piso:', error);
      throw error;
    }
  }
);

// Función HTTP para probar manualmente la generación de facturas
exports.probarGeneracionFacturas = onRequest(
  {
    cors: true,
    maxInstances: 1,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    region: 'us-central1',
    invoker: 'public',
  },
  async (req, res) => {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      await generarFacturasCuotaPiso();
      logger.info('Facturas de cuota de piso generadas correctamente (prueba manual)');
      res.json({ success: true, message: 'Facturas generadas correctamente' });
    } catch (error) {
      logger.error('Error al generar facturas de cuota de piso:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
