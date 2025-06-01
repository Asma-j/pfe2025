const express = require('express');
const router = express.Router();
const path = require('path');
const Matiere = require('../models/Matiere');
const Niveau = require('../models/Niveau');
const { spawn } = require('child_process');
const courseController = require('../controllers/coursController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

router.post('/', authMiddleware, upload, courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', authMiddleware, upload, courseController.updateCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);

router.post('/generate-course-content', authMiddleware, async (req, res) => {
  try {
    const { matiere_id, niveau_id } = req.body;

    if (!matiere_id || !niveau_id) {
      return res.status(400).json({ message: 'matiere_id et niveau_id sont requis' });
    }

    const matiere = await Matiere.findByPk(parseInt(matiere_id));
    const niveau = await Niveau.findByPk(parseInt(niveau_id));
    if (!matiere || !niveau) {
      return res.status(404).json({ message: 'Matière ou niveau introuvable' });
    }

    const prompt = `Génère une suggestion pour un cours intitulé pour une matière "${matiere.nom}" au niveau "${niveau.nom}". Fournis un titre, une description (100-150 mots), et une structure de modules (3-5 modules avec titres courts). Retourne le résultat en JSON: { "titre": "", "description": "", "module": "" }.`;

    console.log('Back-end NLP prompt:', prompt);

    const pythonScriptPath = path.join(__dirname, '../middleware/NLP/nlp_server.py');
    const pythonPath = process.env.PYTHON_PATH || 'python';
    console.log('Python path:', pythonPath);

    const pythonProcess = spawn(pythonPath, [pythonScriptPath, prompt], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('error', (err) => {
      console.error('Spawn error:', err);
      return res.status(500).json({ message: 'Erreur lors du lancement du script Python', error: err.message });
    });

    pythonProcess.on('close', (code) => {
      console.log('Python script stderr:', stderrData);
      if (code !== 0) {
        console.error('Python script error:', stderrData);
        return res.status(500).json({ message: 'Erreur lors de l\'exécution du script Python', error: stderrData });
      }

      try {
        const parsedOutput = JSON.parse(stdoutData);
        console.log('Parsed NLP output:', parsedOutput);
        if (!parsedOutput.titre || !parsedOutput.description || !parsedOutput.module) {
          return res.status(400).json({ message: 'Contenu NLP incomplet ou mal formé', rawOutput: stdoutData });
        }
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.status(200).json(parsedOutput);
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError, stdoutData);
        return res.status(500).json({ message: 'Sortie JSON invalide du script Python', error: parseError.message, rawOutput: stdoutData });
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du contenu NLP:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du contenu NLP', error: error.message });
  }
});

module.exports = router;