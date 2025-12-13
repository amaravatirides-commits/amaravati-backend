exports.acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride already accepted or completed' });
    }

    ride.driver = req.user.id;
    ride.status = 'accepted';

    await ride.save();

    res.json({ message: 'Ride accepted', ride });
  } catch (error) {
    console.error('Error in acceptRide:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
