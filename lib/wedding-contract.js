/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const Aux = require('./aux');
const fs = require('fs');
const { Contract } = require('fabric-contract-api');

class WeddingContract extends Contract {

    async weddingExists(ctx, registrationId) {
        const buffer = await ctx.stub.getState(registrationId);
        return (!!buffer && buffer.length > 0);
    }

    async createWedding(ctx, registrationId, data) {
        const exists = await this.weddingExists(ctx, registrationId);
        if (exists) {
            throw new Error(`A certidão de casamento nº ${registrationId} já está registrada.`);
        }
        const asset = JSON.parse(data);
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(registrationId, buffer);
    }

    async readWedding(ctx, registrationId) {
        const exists = await this.weddingExists(ctx, registrationId);
        if (!exists) {
            throw new Error(`A certidão de casamento nº ${registrationId} não foi encontrada.`);
        }
        const buffer = await ctx.stub.getState(registrationId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateWedding(ctx, registrationId, data) {
        const exists = await this.weddingExists(ctx, registrationId);
        if (!exists) {
            throw new Error(`A certidão de casamento nº ${registrationId} não foi encontrada.`);
        }
        const asset = JSON.parse(data);
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(registrationId, buffer);
    }

    async deleteWedding(ctx, registrationId) {
        const exists = await this.weddingExists(ctx, registrationId);
        if (!exists) {
            throw new Error(`A certidão de casamento nº ${registrationId} não foi encontrada.`);
        }
        await ctx.stub.deleteState(registrationId);
    }


    async readHistory(ctx, registrationId) {
        const exists = await this.weddingExists(ctx, registrationId);

        if (!exists) {
            throw new Error(`A certidão de casamento nº ${registrationId} não foi encontrada.`);
        }

        const history = await ctx.stub.getHistoryForKey(registrationId);
        const weddingHistory = history !== undefined ? await Aux.iteratorForJSON(history, true) : [];
        const stringWeddingHistory = JSON.stringify(weddingHistory);

        fs.writeFile('history.json', stringWeddingHistory, err => {
            if (err) console.error(err)
            console.log(`Criado histórico para a certidão nº ${registrationId}.`);
        });

        return {
            status: 'Success!',
            history: stringWeddingHistory
        }
    }

}

module.exports = WeddingContract;
