// validation.js - Input validation middleware

const validateReport = (req, res, next) => {
  const {
    title,
    description,
    noise_level,
    temperature_feeling,
    pollution_type,
    latitude,
    longitude,
    weather_conditions,
    time_of_day,
    urgency
  } = req.body;

  const errors = [];

  // Required fields
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!latitude || !longitude) {
    errors.push('Latitude and longitude are required');
  }

  // Field length validation
  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  // Enum value validation
  const validNoiseLevels = ['low', 'medium', 'high', 'very_high'];
  if (noise_level && !validNoiseLevels.includes(noise_level)) {
    errors.push(`Noise level must be one of: ${validNoiseLevels.join(', ')}`);
  }

  const validTemperatureFeelings = ['comfortable', 'warm', 'hot', 'unbearable'];
  if (temperature_feeling && !validTemperatureFeelings.includes(temperature_feeling)) {
    errors.push(`Temperature feeling must be one of: ${validTemperatureFeelings.join(', ')}`);
  }

  const validUrgencyLevels = ['low', 'medium', 'high'];
  if (urgency && !validUrgencyLevels.includes(urgency)) {
    errors.push(`Urgency must be one of: ${validUrgencyLevels.join(', ')}`);
  }

  const validTimesOfDay = ['morning', 'afternoon', 'evening', 'night'];
  if (time_of_day && !validTimesOfDay.includes(time_of_day)) {
    errors.push(`Time of day must be one of: ${validTimesOfDay.join(', ')}`);
  }

  // Coordinate validation
  if (latitude && (latitude < -90 || latitude > 90)) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (longitude && (longitude < -180 || longitude > 180)) {
    errors.push('Longitude must be between -180 and 180');
  }

  // Mytilene area validation (optional - για να ελέγχει ότι είναι στη Μυτιλήνη)
  if (latitude && longitude) {
    const mytileneBounds = {
      minLat: 39.0,
      maxLat: 39.2,
      minLng: 26.4,
      maxLng: 26.7
    };

    if (latitude < mytileneBounds.minLat || latitude > mytileneBounds.maxLat ||
        longitude < mytileneBounds.minLng || longitude > mytileneBounds.maxLng) {
      errors.push('Coordinates must be within Mytilene area');
    }
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // If validation passes, continue to the next middleware/controller
  next();
};

// Validation for coordinates only (για spatial queries)
const validateCoordinates = (req, res, next) => {
  const { lat, lng, bbox } = req.query;

  const errors = [];

  if (lat && (lat < -90 || lat > 90)) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (lng && (lng < -180 || lng > 180)) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (bbox) {
    const bboxArray = bbox.split(',').map(coord => parseFloat(coord));
    if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
      errors.push('Bounding box must be 4 numbers: minLng,minLat,maxLng,maxLat');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Coordinate validation failed',
      details: errors
    });
  }

  next();
};

// Validation for analysis parameters
const validateAnalysisParams = (req, res, next) => {
  const { type, radius, timeframe } = req.query;

  const errors = [];

  const validAnalysisTypes = ['heat', 'noise', 'pollution', 'all'];
  if (type && !validAnalysisTypes.includes(type)) {
    errors.push(`Analysis type must be one of: ${validAnalysisTypes.join(', ')}`);
  }

  if (radius && (isNaN(radius) || radius < 100 || radius > 5000)) {
    errors.push('Radius must be a number between 100 and 5000 meters');
  }

  const validTimeframes = ['hour', 'day', 'week', 'month', 'all'];
  if (timeframe && !validTimeframes.includes(timeframe)) {
    errors.push(`Timeframe must be one of: ${validTimeframes.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Analysis parameters validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateReport,
  validateCoordinates,
  validateAnalysisParams
};