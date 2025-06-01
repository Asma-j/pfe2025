import sys
import json
import re
import os
import time
import logging
from transformers import pipeline, set_seed
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, TextClip, CompositeVideoClip
from moviepy.config import change_settings
from PIL import ImageEnhance

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.FileHandler(os.getenv('LOG_PATH', 'nlp_server.log'))
    ]
)
logger = logging.getLogger(__name__)

# Suppress moviepy logs
logging.getLogger('moviepy').setLevel(logging.ERROR)

# Force UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    if os.name == 'nt':
        import _locale
        _locale._getdefaultlocale = (lambda *args: ['en_US', 'utf8'])
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Load model once for performance
logger.info("Loading distilgpt2 model")
generator = pipeline('text-generation', model='distilgpt2')
logger.info("Model loaded successfully")

def generate_course_content(prompt):
    try:
        logger.info("Starting course content generation")
        set_seed(42)
        
        # Extract matiere and niveau from prompt
        matiere_match = re.search(r'matière\s*"([^"]+)"', prompt)
        niveau_match = re.search(r'niveau\s*"([^"]+)"', prompt)
        matiere = matiere_match.group(1).lower() if matiere_match else 'inconnu'
        niveau = niveau_match.group(1).lower() if niveau_match else '1'
        logger.info(f"Extracted matiere: {matiere}, niveau: {niveau}")

        # Define course templates
        course_templates = {
            'php': {
                '1': {
                    'titre': 'PHP Débutant',
                    'description': 'Ce cours initie au développement web avec PHP. Apprenez à créer des sites dynamiques, gérer des bases de données MySQL et développer des formulaires. À travers des exercices pratiques, il couvre les bases du PHP, idéal pour les débutants.',
                    'module': '1. Syntaxe PHP\n2. Formulaires\n3. MySQL\n4. Sessions',
                    'video_script': 'Bienvenue au cours PHP Débutant ! Codez des sites dynamiques avec PHP et MySQL.'
                },
                '2': {
                    'titre': 'PHP Intermédiaire',
                    'description': 'Ce cours approfondit PHP pour des sites web avancés. Apprenez les fonctions avancées, la programmation orientée objet et la sécurité. À travers des projets, il renforce vos compétences en PHP pour des applications robustes.',
                    'module': '1. Fonctions\n2. POO\n3. Sécurité\n4. Projets',
                    'video_script': 'Bienvenue au cours PHP Intermédiaire ! Maîtrisez la POO et la sécurité.'
                },
                'default': {
                    'titre': f'PHP Niveau {niveau.capitalize()}',
                    'description': f'Ce cours explore PHP au niveau {niveau}. Apprenez des concepts adaptés pour créer des projets pratiques. À travers des exercices, il couvre les fondamentaux de PHP pour ce niveau.',
                    'module': '1. Introduction\n2. Concepts\n3. Pratique\n4. Avancé',
                    'video_script': f'Bienvenue au cours PHP Niveau {niveau.capitalize()} ! Lancez-vous !'
                }
            },
            'html': {
                '1': {
                    'titre': 'HTML Débutant',
                    'description': 'Ce cours initie au développement web avec HTML. Apprenez à structurer des pages web, utiliser des balises sémantiques et créer des formulaires. À travers des projets pratiques, il couvre les fondamentaux du HTML pour débutants.',
                    'module': '1. Balises HTML\n2. Structure\n3. Formulaires\n4. Sémantique',
                    'video_script': 'Bienvenue au cours HTML Débutant ! Créez des pages web avec HTML.'
                },
                '2': {
                    'titre': 'HTML Intermédiaire',
                    'description': 'Ce cours approfondit HTML pour des pages web avancées. Apprenez les balises avancées, l’accessibilité et l’intégration CSS. À travers des projets, il renforce vos compétences pour des sites modernes et accessibles.',
                    'module': '1. Balises Avancées\n2. Accessibilité\n3. CSS\n4. Projets',
                    'video_script': 'Bienvenue au cours HTML Intermédiaire ! Maîtrisez l’accessibilité et CSS.'
                },
                'default': {
                    'titre': f'HTML Niveau {niveau.capitalize()}',
                    'description': f'Ce cours explore HTML au niveau {niveau}. Apprenez des concepts adaptés pour créer des projets pratiques. À travers des exercices, il couvre les fondamentaux de HTML pour ce niveau.',
                    'module': '1. Introduction\n2. Concepts\n3. Pratique\n4. Avancé',
                    'video_script': f'Bienvenue au cours HTML Niveau {niveau.capitalize()} ! Lancez-vous !'
                }
            },
            'reactjs': {
                '1': {
                    'titre': 'ReactJS Débutant',
                    'description': 'Ce cours initie au développement d’interfaces utilisateur avec ReactJS. Apprenez à créer des composants réutilisables, gérer l’état avec useState, et comprendre les bases de JSX. À travers des projets pratiques comme une liste de tâches, vous maîtriserez les fondamentaux de ReactJS.',
                    'module': '1. Introduction à ReactJS\n2. Composants et JSX\n3. Gestion d’état\n4. Projet : Liste de tâches',
                    'video_script': 'Bienvenue au cours ReactJS Débutant ! Créez des interfaces avec ReactJS.'
                },
                '2': {
                    'titre': 'ReactJS Intermédiaire',
                    'description': 'Ce cours approfondit vos compétences en ReactJS pour des applications plus complexes. Explorez les hooks avancés comme useEffect et useContext, apprenez à gérer les API avec fetch, et optimisez vos composants pour de meilleures performances.',
                    'module': '1. Hooks Avancés\n2. Appels API\n3. Optimisation\n4. Projet : Gestion de données',
                    'video_script': 'Bienvenue au cours ReactJS Intermédiaire ! Maîtrisez les hooks et API.'
                },
                'default': {
                    'titre': f'ReactJS Niveau {niveau.capitalize()}',
                    'description': f'Ce cours explore ReactJS au niveau {niveau}. Apprenez des concepts adaptés pour créer des projets pratiques et modernes. À travers des exercices, il couvre les fondamentaux et les techniques avancées de ReactJS.',
                    'module': '1. Introduction\n2. Concepts\n3. Pratique\n4. Avancé',
                    'video_script': f'Bienvenue au cours ReactJS Niveau {niveau.capitalize()} ! Lancez-vous !'
                }
            },
            'python': {
                '1': {
                    'titre': 'Python Débutant',
                    'description': 'Ce cours initie à la programmation avec Python. Apprenez les bases comme les variables, les boucles, et les fonctions, et plongez dans des projets simples comme des calculatrices. À travers des exercices pratiques, vous maîtriserez les fondamentaux de Python.',
                    'module': '1. Bases de Python\n2. Structures de contrôle\n3. Fonctions\n4. Projet : Calculatrice',
                    'video_script': 'Bienvenue au cours Python Débutant ! Découvrez les bases de Python.'
                },
                '2': {
                    'titre': 'Python Intermédiaire',
                    'description': 'Ce cours approfondit Python pour des projets plus avancés. Explorez les modules comme NumPy et Pandas, apprenez à manipuler des fichiers, et créez des applications avec des interfaces graphiques.',
                    'module': '1. Modules Avancés\n2. Manipulation de fichiers\n3. Interfaces GUI\n4. Projet : Analyse de données',
                    'video_script': 'Bienvenue au cours Python Intermédiaire ! Maîtrisez NumPy et Pandas.'
                },
                'default': {
                    'titre': f'Python Niveau {niveau.capitalize()}',
                    'description': f'Ce cours explore Python au niveau {niveau}. Apprenez des concepts adaptés pour des projets pratiques et variés. À travers des exercices, il couvre les bases et techniques avancées de Python.',
                    'module': '1. Introduction\n2. Concepts\n3. Pratique\n4. Avancé',
                    'video_script': f'Bienvenue au cours Python Niveau {niveau.capitalize()} ! Lancez-vous !'
                }
            },
            'default': {
                'default': {
                    'titre': f'Introduction à {matiere.capitalize()}',
                    'description': f'Ce cours initie à {matiere.capitalize()} au niveau {niveau}. Apprenez les bases pour créer des projets pratiques. À travers des exercices, il couvre les fondamentaux de {matiere.capitalize()}.',
                    'module': '1. Introduction\n2. Concepts\n3. Pratique\n4. Avancé',
                    'video_script': f'Bienvenue au cours {matiere.capitalize()} ! Lancez-vous !'
                }
            }
        }

        # Select template
        template = course_templates.get(matiere, course_templates['default']).get(niveau, course_templates.get(matiere, course_templates['default'])['default'])
        logger.info(f"Using template for matiere: {matiere}, niveau: {niveau}")

        # Simplify prompt
        clean_prompt = re.sub(r'\\+', '', prompt)
        clean_prompt = clean_prompt.replace(
            'Retourne le résultat en JSON: { "titre": "", "description": "", "module": "" }.',
            f'Generate a JSON object for a {matiere.capitalize()} course (level {niveau}) with a title, description (100-150 words), 3-4 short module titles, and a video script (50-100 words).'
        )

        # Generate text
        logger.info("Generating text with distilgpt2")
        response = generator(
            clean_prompt,
            max_length=600,
            num_return_sequences=1,
            truncation=True,
            pad_token_id=50256,
            temperature=0.7,
            top_p=0.9,
        )
        generated_text = response[0]['generated_text']
        logger.info(f"Raw generated text: {generated_text}")

        # Extract JSON
        json_match = re.search(r'\{[\s\S]*?\}', generated_text)
        if not json_match:
            logger.warning("No JSON found in generated text")
            fallback = {
                "titre": template['titre'],
                "description": template['description'],
                "module": template['module'],
                "video_script": template['video_script'],
                "image_path": "",
                "pdf_path": "",
                "video_path": ""
            }
        else:
            json_str = json_match.group(0)
            try:
                parsed_json = json.loads(json_str)
                if not all(key in parsed_json for key in ['titre', 'description', 'module']):
                    logger.warning("Missing required JSON fields")
                    fallback = {
                        "titre": template['titre'],
                        "description": template['description'],
                        "module": template['module'],
                        "video_script": template['video_script'],
                        "image_path": "",
                        "pdf_path": "",
                        "video_path": ""
                    }
                else:
                    parsed_json["video_script"] = parsed_json.get("video_script", template['video_script'])
                    parsed_json["image_path"] = ""
                    parsed_json["pdf_path"] = ""
                    parsed_json["video_path"] = ""
                    fallback = parsed_json
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {str(e)}")
                fallback = {
                    "titre": template['titre'],
                    "description": template['description'],
                    "module": template['module'],
                    "video_script": template['video_script'],
                    "image_path": "",
                    "pdf_path": "",
                    "video_path": ""
                }

        # Ensure module length <= 100 characters
        if len(fallback['module']) > 100:
            fallback['module'] = fallback['module'][:97] + '...'
            logger.info(f"Truncated module to: {fallback['module']}")

        # Define output directory
        output_dir = os.getenv('OUTPUT_DIR', 'C:/Users/ASUS/Desktop/pfe2025/backend/Uploads')
        os.makedirs(output_dir, exist_ok=True)

        # Generate PDF
        try:
            logger.info("Generating PDF")
            pdf_filename = f"{matiere}_course_pdf_{int(time.time())}.pdf"
            pdf_path = os.path.join(output_dir, pdf_filename)
            doc = SimpleDocTemplate(pdf_path, pagesize=letter)
            styles = getSampleStyleSheet()
            content = [
                Paragraph(fallback["titre"], styles['Title']),
                Spacer(1, 12),
                Paragraph(fallback["description"], styles['Normal']),
                Spacer(1, 12),
                Paragraph("Modules:", styles['Heading2']),
                Paragraph(fallback["module"].replace("\n", "<br/>"), styles['Normal'])
            ]
            doc.build(content)
            fallback["pdf_path"] = pdf_filename
            logger.info(f"PDF generated: {pdf_filename}")
        except Exception as e:
            logger.error(f"PDF generation error: {str(e)}")

        # Generate placeholder image with centered text
        try:
            logger.info("Generating placeholder image")
            image_filename = f"{matiere}_course_image_{int(time.time())}.png"
            image_path = os.path.join(output_dir, image_filename)
            
            # Define color scheme based on matiere
            color_schemes = {
                'python': ((0, 75, 150), (0, 150, 255)),
                'php': ((138, 43, 226), (75, 0, 130)),
                'html': ((255, 165, 0), (255, 140, 0)),
                'reactjs': ((60, 186, 84), (34, 139, 34)),
                'default': ((73, 109, 137), (135, 206, 235))
            }
            start_color, end_color = color_schemes.get(matiere, color_schemes['default'])

            # Create image with gradient background
            img = Image.new('RGB', (400, 400))
            draw = ImageDraw.Draw(img)
            for y in range(400):
                r = start_color[0] + (end_color[0] - start_color[0]) * y / 400
                g = start_color[1] + (end_color[1] - start_color[1]) * y / 400
                b = start_color[2] + (end_color[2] - start_color[2]) * y / 400
                draw.line([(0, y), (400, y)], fill=(int(r), int(g), int(b)))

            # Load fonts
            try:
                font_title = ImageFont.truetype("arial.ttf", 40)
                font_sub = ImageFont.truetype("arial.ttf", 30)
            except:
                logger.warning("Arial font not found, using default font")
                font_title = ImageFont.load_default()
                font_sub = ImageFont.load_default()

            # Text to display
            title_text = fallback["titre"]
            subtitle_text = f"Matière: {matiere.capitalize()} - Niveau: {niveau}"

            # Calculate text size and position for centering
            title_bbox = draw.textbbox((0, 0), title_text, font=font_title)
            title_width = title_bbox[2] - title_bbox[0]
            title_height = title_bbox[3] - title_bbox[1]
            title_x = (400 - title_width) // 2
            title_y = (400 - title_height) // 2 - 20

            subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=font_sub)
            subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
            subtitle_height = subtitle_bbox[3] - subtitle_bbox[1]
            subtitle_x = (400 - subtitle_width) // 2
            subtitle_y = title_y + title_height + 30  # Increased spacing from 10 to 30

            # Draw centered text
            draw.text((title_x, title_y), title_text, fill=(255, 255, 255), font=font_title)
            draw.text((subtitle_x, subtitle_y), subtitle_text, fill=(255, 255, 255), font=font_sub)

            # Enhance image contrast
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)

            img.save(image_path)
            fallback["image_path"] = image_filename
            logger.info(f"Image generated: {image_filename}")
        except Exception as e:
            logger.error(f"Image generation error: {str(e)}")

        # Generate placeholder video
        try:
            logger.info("Generating placeholder video")
            video_filename = f"{matiere}_course_video_{int(time.time())}.mp4"
            video_path = os.path.join(output_dir, video_filename)
            
            # Configure ImageMagick path
            change_settings({"IMAGEMAGICK_BINARY": os.getenv('IMAGEMAGICK_BINARY', r"C:\Program Files\ImageMagick-7.1.1-Q16\magick.exe")})
            
            # Create a static image clip
            img_clip = ImageClip(image_path, duration=5)
            
            # Add text overlay with video_script
            txt_clip = TextClip(fallback["video_script"], fontsize=24, color='white', bg_color='black', size=(400, 100))
            txt_clip = txt_clip.set_duration(5).set_position(('center', 'bottom'))
            
            # Combine clips using CompositeVideoClip for overlay
            final_video = CompositeVideoClip([img_clip, txt_clip])
            final_video.write_videofile(video_path, fps=24, codec="libx264", logger=None)
            
            fallback["video_path"] = video_filename
            logger.info(f"Video generated: {video_filename}")
        except Exception as e:
            logger.error(f"Video generation error: {str(e)}")

        logger.info("Course content generation completed")
        return fallback

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            "titre": template['titre'],
            "description": f"Erreur lors de la génération: {str(e)}",
            "module": template['module'],
            "video_script": "Erreur lors de la génération du script vidéo.",
            "image_path": "",
            "pdf_path": "",
            "video_path": ""
        }

if __name__ == '__main__':
    try:
        if len(sys.argv) < 2:
            raise ValueError('Prompt is required as a command-line argument')
        prompt = sys.argv[1]
        result = generate_course_content(prompt)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        logger.error(f"Main error: {str(e)}")
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)