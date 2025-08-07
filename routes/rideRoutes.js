const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { protectUser } = require('../middleware/userAuthMiddleware');
const { protect: protectDriver } = require('../middleware/driverAuthMiddleware');
const geolib = require('geolib'); // ✅ Added for fare calculation

// @desc Request a new ride
// @route POST /api/rides
// @access Private (User only)
router.post('/', protectUser, async (req, res) => {
    const { origin, destination } = req.body;

    if (!origin || !destination || !origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) {
        return res.status(400).json({ message: 'Please provide origin and destination with latitude and longitude.' });
    }

    try {
        const ride = new Ride({
            user: req.user.id,
            pickupLocation: {
                type: 'Point',
                coordinates: [origin.longitude, origin.latitude],
            },
            dropoffLocation: {
                type: 'Point',
                coordinates: [destination.longitude, destination.latitude],
            }
        });

        // ✅ Distance and fare calculation
        const distanceInMeters = geolib.getDistance(
            { latitude: origin.latitude, longitude: origin.longitude },
            { latitude: destination.latitude, longitude: destination.longitude }
        );

        const baseFare = 10;
        const perKmRate = 5;
        const distanceInKm = distanceInMeters / 1000;
        const fare = baseFare + (distanceInKm * perKmRate);

        ride.fare = Math.round(fare * 100) / 100;

        const createdRide = await ride.save();
        res.status(201).json({
            message: 'Ride request created successfully.',
            ride: createdRide
        });
    } catch (error) {
        console.error('Ride request error:', error);
        res.status(500).json({ message: 'Server error creating ride request.' });
    }
});

// @desc Get all rides for the logged-in user
// @route GET /api/rides/my-rides
// @access Private (User only)
router.get('/my-rides', protectUser, async (req, res) => {
    try {
        const rides = await Ride.find({ user: req.user.id }).sort({ createdAt: -1 });

        if (rides.length === 0) {
            return res.status(404).json({ message: 'No ride history found for this user.' });
        }

        res.status(200).json({
            message: 'User ride history fetched successfully.',
            rides,
        });
    } catch (error) {
        console.error('Error fetching user ride history:', error);
        res.status(500).json({ message: 'Server error fetching ride history.' });
    }
});

// @desc Get all available pending rides for drivers
// @route GET /api/rides/available
// @access Private (Driver only)
router.get('/available', protectDriver, async (req, res) => {
    try {
        const availableRides = await Ride.find({
            status: 'requested',
            driver: null
        }).sort({ createdAt: 1 });

        if (availableRides.length === 0) {
            return res.status(404).json({ message: 'No available rides found at the moment.' });
        }

        res.status(200).json({
            message: 'Available rides fetched successfully.',
            rides: availableRides,
        });
    } catch (error) {
        console.error('Error fetching available rides:', error);
        res.status(500).json({ message: 'Server error fetching available rides.' });
    }
});

// @desc Driver accepts a pending ride
// @route PUT /api/rides/:id/accept
// @access Private (Driver only)
router.put('/:id/accept', protectDriver, async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found.' });
        }

        if (ride.status !== 'requested' || ride.driver !== null) {
            return res.status(400).json({ message: 'Ride is not available for acceptance.' });
        }

        ride.driver = req.driver.id;
        ride.status = 'accepted';

        const updatedRide = await ride.save();

        res.status(200).json({
            message: 'Ride accepted successfully.',
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error accepting ride:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ride ID format.' });
        }
        res.status(500).json({ message: 'Server error accepting ride.' });
    }
});

// @desc Driver updates ride status
// @route PUT /api/rides/:id/update-status
// @access Private (Driver only)
router.put('/:id/update-status', protectDriver, async (req, res) => {
    const { status } = req.body;

    const validStatuses = ['started', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found.' });
        }

        if (ride.driver.toString() !== req.driver.id) {
            return res.status(403).json({ message: 'Not authorized to update this ride.' });
        }

        if (['completed', 'cancelled'].includes(ride.status)) {
            return res.status(400).json({ message: `Cannot update a ride that is already ${ride.status}.` });
        }

        if (status === 'started' && ride.status !== 'accepted') {
            return res.status(400).json({ message: 'Ride must be accepted before it can be started.' });
        }
        if (status === 'completed' && ride.status !== 'started') {
            return res.status(400).json({ message: 'Ride must be started before it can be completed.' });
        }

        ride.status = status;
        const updatedRide = await ride.save();

        res.status(200).json({
            message: `Ride status updated to ${updatedRide.status}.`,
            ride: updatedRide
        });

    } catch (error) {
        console.error('Error updating ride status:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ride ID format.' });
        }
        res.status(500).json({ message: 'Server error updating ride status.' });
    }
});

module.exports = router;
