// Copyright 2015 Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var units = require('../utils/constants').units;

/**
 * @class pHYs
 * @module PNG
 * @submodule PNGChunks
 */
module.exports = {

	/**
	 * Gets the chunk-type as string
	 *
	 * @method getType
	 * @return {string}
	 */
	getType: function () {
		return 'pHYs';
	},

	/**
	 * Gets the chunk-type as id
	 *
	 * @method getTypeId
	 * @return {int}
	 */
	getTypeId: function () {
		return 0x70485973;
	},

	/**
	 * Gets the sequence
	 *
	 * @method getSequence
	 * @return {int}
	 */
	getSequence: function () {
		return 140;
	},


	/**
	 * Gets the horizontal number of pixel per unit
	 *
	 * @method getXPixelPerUnit
	 * @return {int}
	 */
	getXPixelPerUnit: function () {
		return this._xPPU || 1;
	},

	/**
	 * Sets the horizontal number of pixel per unit
	 *
	 * @method setXPixelPerUnit
	 * @param {int} ppu Pixel per unit
	 */
	setXPixelPerUnit: function (ppu) {
		this._xPPU = ppu;
	},


	/**
	 * Gets the vertical number of pixel per unit
	 *
	 * @method getYPixelPerUnit
	 * @return {int}
	 */
	getYPixelPerUnit: function () {
		return this._yPPU || 1;
	},

	/**
	 * Sets the vertical number of pixel per unit
	 *
	 * @method setYPixelPerUnit
	 * @param {int} ppu Pixel per unit
	 */
	setYPixelPerUnit: function (ppu) {
		this._yPPU = ppu;
	},


	/**
	 * Gets the unit identifier
	 *
	 * @method getUnit
	 * @return {int}
	 */
	getUnit: function () {
		return this._unit || 0;
	},

	/**
	 * Sets the unit identifier
	 *
	 * @method setUnit
	 * @param {int} unit Unit identifier
	 */
	setUnit: function (unit) {
		if ([units.UNKNOWN, units.METER].indexOf(unit) === -1) {
			throw new Error('Unit identifier ' + unit + ' is not valid.');
		}
		this._unit = unit;
	},


	/**
	 * Is unit unknown?
	 *
	 * @method isUnitUnknown
	 * @return {boolean}
	 */
	isUnitUnknown: function () {
		return (this._unit === units.UNKNOWN);
	},

	/**
	 * Is unit in meter?
	 *
	 * @method isUnitInMeter
	 * @return {boolean}
	 */
	isUnitInMeter: function () {
		return (this._unit === units.METER);
	},


	/**
	 * Encoding of chunk data
	 *
	 * @method encode
	 * @param {BufferedStream} stream Data stream
	 */
	encode: function (stream) {
		stream.writeUInt32BE(this.getXPixelPerUnit());
		stream.writeUInt32BE(this.getYPixelPerUnit());
		stream.writeUInt8(this.getUnit());
	},

	/**
	 * Parsing of chunk data
	 *
	 * @method parse
	 * @param {BufferedStream} stream Data stream
	 * @param {int} length Length of chunk data
	 * @param {boolean} strict Should parsing be strict?
	 */
	parse: function (stream, length, strict) {

		// Validation
		if (!this.getFirstChunk('IHDR', false) === null) {
			throw new Error('Chunk ' + this.getType() + ' requires the IHDR chunk.');
		}

		if (this.getFirstChunk(this.getType(), false) !== null) {
			throw new Error('Only one ' + this.getType() + ' is allowed in the data.');
		}

		if (length !== 9) {
			throw new Error('The length of chunk ' + this.getType() + ' should be 9, but got ' + length + '.');
		}

		this.setXPixelPerUnit(stream.readUInt32BE());
		this.setYPixelPerUnit(stream.readUInt32BE());
		this.setUnit(stream.readUInt8());
	},


	/**
	 * Returns a list of chunks to be added to the data-stream
	 *
	 * @method encodeData
	 * @param {Buffer} image Image data
	 * @param {object} data Object that will be used to import data to the chunk
	 * @return {Chunk[]} List of chunks to encode
	 */
	encodeData: function (image, data) {

		if (data.physical) {

			var chunk = this.createChunk(this.getType(), this.getChunks());

			if (data.physical.xPixelPerUnit !== undefined) {
				chunk.setXPixelPerUnit(data.physical.xPixelPerUnit);
			}
			if (data.physical.yPixelPerUnit !== undefined) {
				chunk.setYPixelPerUnit(data.physical.yPixelPerUnit);
			}
			if (data.physical.unit !== undefined) {
				chunk.setUnit(data.physical.unit);
			}

			return [chunk];
		} else {
			return [];
		}
	},

	/**
	 * Gathers chunk-data from decoded chunks
	 *
	 * @method decodeData
	 * @param {object} data Data-object that will be used to export values
	 * @param {boolean} strict Should parsing be strict?
	 */
	decodeData: function (data, strict) {

		var chunks = this.getChunksByType(this.getType());

		if (!chunks) {
			return ;
		}

		if (chunks.length !== 1) {
			throw new Error('Not more than one chunk allowed for ' + this.getType() + '.');
		}

		data.volatile = data.volatile || {};
		data.volatile.physical = {
			xPixelPerUnit: chunks[0].getXPixelPerUnit(),
			yPixelPerUnit: chunks[0].getYPixelPerUnit(),
			unit: chunks[0].getUnit()
		};
	}
};