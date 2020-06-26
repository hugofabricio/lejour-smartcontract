/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { WeddingContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('WeddingContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new WeddingContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"wedding 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"wedding 1002 value"}'));
    });

    describe('#weddingExists', () => {

        it('should return true for a wedding', async () => {
            await contract.weddingExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a wedding that does not exist', async () => {
            await contract.weddingExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createWedding', () => {

        it('should create a wedding', async () => {
            await contract.createWedding(ctx, '1003', 'wedding 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"wedding 1003 value"}'));
        });

        it('should throw an error for a wedding that already exists', async () => {
            await contract.createWedding(ctx, '1001', 'myvalue').should.be.rejectedWith(/The wedding 1001 already exists/);
        });

    });

    describe('#readWedding', () => {

        it('should return a wedding', async () => {
            await contract.readWedding(ctx, '1001').should.eventually.deep.equal({ value: 'wedding 1001 value' });
        });

        it('should throw an error for a wedding that does not exist', async () => {
            await contract.readWedding(ctx, '1003').should.be.rejectedWith(/The wedding 1003 does not exist/);
        });

    });

    describe('#updateWedding', () => {

        it('should update a wedding', async () => {
            await contract.updateWedding(ctx, '1001', 'wedding 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"wedding 1001 new value"}'));
        });

        it('should throw an error for a wedding that does not exist', async () => {
            await contract.updateWedding(ctx, '1003', 'wedding 1003 new value').should.be.rejectedWith(/The wedding 1003 does not exist/);
        });

    });

    describe('#deleteWedding', () => {

        it('should delete a wedding', async () => {
            await contract.deleteWedding(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a wedding that does not exist', async () => {
            await contract.deleteWedding(ctx, '1003').should.be.rejectedWith(/The wedding 1003 does not exist/);
        });

    });

});