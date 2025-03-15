// tests/api.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Assurez-vous que votre serveur est exporté dans server.js
const sql = require('mssql');
const config = require('../dbConfig');

chai.use(chaiHttp);
chai.should();

describe('API Tests', () => {
  before(async () => {
    // Connecter à la base de données pour initialiser l'environnement de test
    try {
      await sql.connect(config);
      console.log('Connecté à SQL Server');
    } catch (err) {
      console.error('Erreur de connexion à SQL Server', err);
    }
  });

  after(async () => {
    // Déconnexion de la base de données après les tests
    await sql.close();
  });

  it('should return a list of items from the API', (done) => {
    chai.request(server)
      .get('/api/items') // Remplacez par votre point d'API
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });
// Test POST: Ajouter un nouvel élément
it('should add a new item', (done) => {
  const newItem = {
    name: 'New Item',
    description: 'Description of the new item'
  };

  chai.request(server)
    .post('/api/items') // Remplacez par votre point d'API
    .send(newItem)
    .end((err, res) => {
      res.should.have.status(201); // Statut de création
      res.body.should.have.property('id');
      res.body.name.should.equal(newItem.name);
      res.body.description.should.equal(newItem.description);
      done();
    });
});

// Test PUT: Mettre à jour un élément
it('should update an item', (done) => {
  const updatedItem = {
    name: 'Updated Item',
    description: 'Updated description'
  };

  // Supposons que l'ID de l'élément à mettre à jour est 1
  chai.request(server)
    .put('/api/items/1') // Remplacez par l'ID de votre élément
    .send(updatedItem)
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.have.property('name').eql(updatedItem.name);
      res.body.should.have.property('description').eql(updatedItem.description);
      done();
    });
});

// Test DELETE: Supprimer un élément
it('should delete an item', (done) => {
  // Supposons que l'ID de l'élément à supprimer est 1
  chai.request(server)
    .delete('/api/items/1') // Remplacez par l'ID de votre élément
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.have.property('message').eql('Item deleted successfully');
      done();
    });
});
});
