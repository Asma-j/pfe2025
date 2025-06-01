const Course = require('../models/Cours');
const axios = require('axios');
const Matiere = require('../models/Matiere');
const Utilisateur = require('../models/Utilisateur');
const Niveau = require('../models/Niveau');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

exports.createCourse = async (req, res) => {
  try {
    let { titre, description, prix, module, status, matiere_id, niveau_id, image_path, pdf_path, video_path } = req.body;
    const image = req.files && req.files.image ? req.files.image[0].filename : image_path || null;
    const files = req.files && req.files.files ? req.files.files.map(file => file.filename) : pdf_path ? [pdf_path] : [];
    const video = req.files && req.files.video ? req.files.video[0].filename : video_path || null;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const userRole = req.user.role ? String(req.user.role).toLowerCase() : null;
    if (userRole !== 'enseignant') {
      return res.status(403).json({ message: 'Seuls les enseignants peuvent créer des cours' });
    }

    if (!matiere_id) {
      return res.status(400).json({ message: 'Le champ matiere_id est requis' });
    }
    if (!niveau_id) {
      return res.status(400).json({ message: 'Le champ niveau_id est requis' });
    }

    const matiere = await Matiere.findByPk(parseInt(matiere_id));
    const niveau = await Niveau.findByPk(parseInt(niveau_id));
    if (!matiere || !niveau) {
      return res.status(404).json({ message: 'Matière ou niveau introuvable' });
    }

    if (!titre || !description || !module) {
      const prompt = `Génère une suggestion pour un cours intitulé pour une matière "${matiere.nom}" au niveau "${niveau.nom}". Fournis un titre, une description (100-150 mots), et une structure de modules (3-5 modules avec titres courts). Retourne le résultat en JSON: { "titre": "", "description": "", "module": "" }.`;

      console.log('Back-end NLP prompt:', prompt);

      try {
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
          throw new Error(`Failed to spawn Python process: ${err.message}`);
        });

        const aiContent = await new Promise((resolve, reject) => {
          pythonProcess.on('close', (code) => {
            console.log('Python script stderr:', stderrData);
            if (code !== 0) {
              console.error('Python script error:', stderrData);
              reject(new Error(`Python script exited with code ${code}: ${stderrData}`));
              return;
            }

            try {
              const parsedOutput = JSON.parse(stdoutData);
              console.log('Parsed NLP output:', parsedOutput);
              resolve(parsedOutput);
            } catch (parseError) {
              console.error('Error parsing Python output:', parseError, stdoutData);
              reject(new Error('Invalid JSON output from Python script'));
            }
          });
        });

        if (!aiContent.titre || !aiContent.description || !aiContent.module) {
          throw new Error('Contenu NLP incomplet ou mal formé');
        }

        titre = titre || aiContent.titre.substring(0, 255);
        description = description || aiContent.description;
        module = module || aiContent.module;
        image_path = image_path || aiContent.image_path;
        pdf_path = pdf_path || aiContent.pdf_path;
        video_path = video_path || aiContent.video_path;
      } catch (nlpError) {
        console.error('Back-end NLP generation error:', nlpError);
        return res.status(500).json({ message: 'Erreur lors de la génération du contenu NLP', error: nlpError.message, stderr: stderrData });
      }
    }

    // Preprocess module
    if (module) {
      module = module.replace(/\r\n/g, '\n'); // Normalize line endings
      if (module.length > 100) { // Fit Cours model
        module = module.substring(0, 97) + '...';
      }
    }

    const created_by = req.user.id;

    const newCourse = await Course.create({
      titre,
      description,
      prix: prix || 0,
      module,
      status: status || 'Gratuit',
      matiere_id,
      niveau_id,
      created_by,
      image,
      files,
      video,
    });

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(201).json({ message: 'Cours créé avec succès', course: newCourse });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la création du cours', error: error.message });
  }
};
exports.getAllCourses = async (req, res) => {
  try {
    const { matiere_id, niveau_id } = req.query;
    const whereClause = {};
    if (matiere_id) whereClause.matiere_id = matiere_id;
    if (niveau_id) whereClause.niveau_id = niveau_id;

    const courses = await Course.findAll({
      where: whereClause,
      include: [
        { model: Matiere, attributes: ['nom'] },
        { model: Utilisateur, as: 'Creator', attributes: ['nom', 'prenom'] },
        { model: Niveau, attributes: ['nom'] },
      ],
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des cours', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id },
      include: [
        { model: Matiere, attributes: ['nom'] },
        { model: Utilisateur, as: 'Creator', attributes: ['nom', 'prenom'] },
        { model: Niveau, attributes: ['nom'] },
      ],
    });
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du cours', error: error.message });
  }
};
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, prix, module, status, matiere_id, niveau_id } = req.body;
    const newImage = req.files && req.files.image ? req.files.image[0].filename : null;
    const newFiles = req.files && req.files.files ? req.files.files.map(file => file.filename) : null;
    const newVideo = req.files && req.files.video ? req.files.video[0].filename : null;

    const oldCourse = await Course.findByPk(id);
    if (!oldCourse) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Handle image
    let imageToUse = oldCourse.image;
    if (newImage) {
      imageToUse = newImage;
      if (oldCourse.image) {
        const oldImagePath = path.join(__dirname, '../Uploads', oldCourse.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Handle files
    let filesToUse = oldCourse.files;
    // Ensure filesToUse is an array
    if (filesToUse && !Array.isArray(filesToUse)) {
      if (typeof filesToUse === 'string') {
        try {
          filesToUse = JSON.parse(filesToUse);
          if (!Array.isArray(filesToUse)) {
            filesToUse = [];
          }
        } catch (e) {
          console.error('Error parsing oldCourse.files:', e);
          filesToUse = [];
        }
      } else {
        filesToUse = [];
      }
    }
    if (newFiles) {
      // If new files are uploaded, replace the old files
      if (Array.isArray(filesToUse) && filesToUse.length > 0) {
        filesToUse.forEach(file => {
          const filePath = path.join(__dirname, '../Uploads', file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      filesToUse = Array.isArray(newFiles) ? newFiles : [];
    }

    // Handle video
    let videoToUse = oldCourse.video;
    if (newVideo) {
      videoToUse = newVideo;
      if (oldCourse.video) {
        const oldVideoPath = path.join(__dirname, '../Uploads', oldCourse.video);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
    }

    const [updated] = await Course.update(
      {
        titre,
        description,
        prix,
        module,
        status,
        matiere_id,
        niveau_id,
        image: imageToUse,
        files: filesToUse,
        video: videoToUse,
      },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    const updatedCourse = await Course.findByPk(id);
    res.status(200).json({ message: 'Cours mis à jour avec succès', course: updatedCourse });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du cours', error: error.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Delete associated image
    if (course.image) {
      const imagePath = path.join(__dirname, '../Uploads', course.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Handle course.files
    let files = [];
    if (course.files) {
      // If files is a JSON string, parse it; otherwise, ensure it's an array
      files = typeof course.files === 'string' ? JSON.parse(course.files) : course.files;
      // Ensure files is an array
      files = Array.isArray(files) ? files : [files];
      files.forEach(file => {
        const filePath = path.join(__dirname, '../Uploads', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete associated video
    if (course.video) {
      const videoPath = path.join(__dirname, '../Uploads', course.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Course.destroy({ where: { id } });
    res.status(200).json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du cours', error: error.message });
  }
};