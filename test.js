const chai  =require ('chai');
const chaiHttp = require('chai-http')
const imported = require('./index');
const expect = chai.expect;
chai.use(chaiHttp);


describe('API #1 TESTING',()=>
{
    it('It should return the homepage of the app',(done)=>
    {
        chai.request(imported).get('/').end((err,res)=>
        {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.equal("Welcome to chatApplication")
            done();
        })
    })
})