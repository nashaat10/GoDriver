import mongoose from 'mongoose'


// Base alert schema for common fields
const alertSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    alertTime: {
        type: Date,
        required: true,
    },
    alertType: {
        type: String,
        required: true,
        enum: ['speedAlert', 'lowFuel']
    },
    message: {
        type: String,
        required: true,
    },
    details: {
        speed: {
            type: Number,
            required: function() { return this.alertType === 'speedAlert'; }
        },
        fuelLevel: {
            type: Number,
            required: function() { return this.alertType === 'lowFuel'; }
        }
    }
}, { collection: 'alerts' });


// Create model

// Vehicle Data Schema
const vehicleDataSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A Vehicle must have a driver'],
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
    },
    fuelLevel: { 
        type: Number, 
        required: true 
    },
    speed: { 
        type: Number, 
        required: true 
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: false,
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create models
const VehicleData = mongoose.model('VehicleData', vehicleDataSchema);
const Alert = mongoose.model('Alert', alertSchema);

export { VehicleData, Alert };