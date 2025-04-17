-- Mock data for locations and their specific categories

-- Academic Buildings
WITH academic_insert AS (
    INSERT INTO locations (
        name, description, address, latitude, longitude, contact_number, 
        email, website_url, building_type, opening_hours
    ) VALUES 
    (
        'Engineering Complex',
        'Home to the College of Engineering with state-of-the-art laboratories and research facilities',
        'Main Campus, Engineering Drive',
        5.6378, -0.1871,
        '+233 20 123 4567',
        'engineering@campus.edu',
        'https://engineering.campus.edu',
        'academic',
        '{"monday":{"open":"07:00","close":"22:00"},"tuesday":{"open":"07:00","close":"22:00"},"wednesday":{"open":"07:00","close":"22:00"},"thursday":{"open":"07:00","close":"22:00"},"friday":{"open":"07:00","close":"20:00"},"saturday":{"open":"09:00","close":"17:00"},"sunday":{"open":"","close":""}}'::jsonb
    ),
    (
        'Science Block',
        'Houses the departments of Physics, Chemistry, and Biology',
        'Science Avenue, Main Campus',
        5.6380, -0.1875,
        '+233 20 123 4568',
        'sciences@campus.edu',
        'https://sciences.campus.edu',
        'academic',
        '{"monday":{"open":"08:00","close":"21:00"},"tuesday":{"open":"08:00","close":"21:00"},"wednesday":{"open":"08:00","close":"21:00"},"thursday":{"open":"08:00","close":"21:00"},"friday":{"open":"08:00","close":"18:00"},"saturday":{"open":"09:00","close":"15:00"},"sunday":{"open":"","close":""}}'::jsonb
    )
    RETURNING id, name
)
INSERT INTO academic_buildings (id, department, faculty_count, facilities, accessibility_features)
SELECT 
    id,
    CASE 
        WHEN name = 'Engineering Complex' THEN 'College of Engineering'
        ELSE 'College of Sciences'
    END,
    CASE 
        WHEN name = 'Engineering Complex' THEN 120
        ELSE 85
    END,
    CASE 
        WHEN name = 'Engineering Complex' 
        THEN '["laboratories","lecture halls","research centers","computer labs","workshop spaces"]'::jsonb
        ELSE '["laboratories","lecture halls","research facilities","observatory","specimen collection"]'::jsonb
    END,
    ARRAY['elevators', 'ramps', 'accessible restrooms']
FROM academic_insert;

-- Libraries
WITH library_insert AS (
    INSERT INTO locations (
        name, description, address, latitude, longitude, contact_number, 
        email, website_url, building_type, opening_hours
    ) VALUES 
    (
        'Main Library',
        'The central library facility with extensive collection of books, journals, and digital resources',
        'Library Road, Central Campus',
        5.6375, -0.1870,
        '+233 20 123 4569',
        'library@campus.edu',
        'https://library.campus.edu',
        'library',
        '{"monday":{"open":"06:00","close":"00:00"},"tuesday":{"open":"06:00","close":"00:00"},"wednesday":{"open":"06:00","close":"00:00"},"thursday":{"open":"06:00","close":"00:00"},"friday":{"open":"06:00","close":"22:00"},"saturday":{"open":"08:00","close":"20:00"},"sunday":{"open":"12:00","close":"20:00"}}'::jsonb
    ),
    (
        'Digital Resource Center',
        'Modern library facility focused on digital resources and technology',
        'Innovation Hub, East Campus',
        5.6377, -0.1868,
        '+233 20 123 4570',
        'digital.library@campus.edu',
        'https://digital.library.campus.edu',
        'library',
        '{"monday":{"open":"08:00","close":"22:00"},"tuesday":{"open":"08:00","close":"22:00"},"wednesday":{"open":"08:00","close":"22:00"},"thursday":{"open":"08:00","close":"22:00"},"friday":{"open":"08:00","close":"20:00"},"saturday":{"open":"09:00","close":"18:00"},"sunday":{"open":"12:00","close":"18:00"}}'::jsonb
    )
    RETURNING id, name
)
INSERT INTO libraries (id, total_capacity, study_rooms_count, computer_count, special_collections, services)
SELECT 
    id,
    CASE 
        WHEN name = 'Main Library' THEN 1200
        ELSE 500
    END,
    CASE 
        WHEN name = 'Main Library' THEN 25
        ELSE 15
    END,
    CASE 
        WHEN name = 'Main Library' THEN 200
        ELSE 150
    END,
    CASE 
        WHEN name = 'Main Library' 
        THEN ARRAY['Rare Books', 'Historical Manuscripts', 'African Studies Collection']
        ELSE ARRAY['Digital Archives', 'Technical Publications', 'E-Resources']
    END,
    ARRAY['printing', 'scanning', 'research assistance', 'interlibrary loan']
FROM library_insert;

-- Dining Halls
WITH dining_insert AS (
    INSERT INTO locations (
        name, description, address, latitude, longitude, contact_number, 
        email, website_url, building_type, opening_hours
    ) VALUES 
    (
        'Central Dining Hall',
        'Main campus dining facility offering diverse meal options',
        'Dining Square, Central Campus',
        5.6376, -0.1873,
        '+233 20 123 4571',
        'dining@campus.edu',
        'https://dining.campus.edu',
        'dining',
        '{"monday":{"open":"06:30","close":"21:00"},"tuesday":{"open":"06:30","close":"21:00"},"wednesday":{"open":"06:30","close":"21:00"},"thursday":{"open":"06:30","close":"21:00"},"friday":{"open":"06:30","close":"20:00"},"saturday":{"open":"07:30","close":"19:00"},"sunday":{"open":"07:30","close":"19:00"}}'::jsonb
    ),
    (
        'International Food Court',
        'Modern dining facility featuring international cuisines',
        'Student Center, West Campus',
        5.6379, -0.1876,
        '+233 20 123 4572',
        'foodcourt@campus.edu',
        'https://foodcourt.campus.edu',
        'dining',
        '{"monday":{"open":"10:00","close":"22:00"},"tuesday":{"open":"10:00","close":"22:00"},"wednesday":{"open":"10:00","close":"22:00"},"thursday":{"open":"10:00","close":"22:00"},"friday":{"open":"10:00","close":"23:00"},"saturday":{"open":"11:00","close":"23:00"},"sunday":{"open":"11:00","close":"22:00"}}'::jsonb
    )
    RETURNING id, name
)
INSERT INTO dining_halls (id, cuisine_types, seating_capacity, meal_plans_accepted, dietary_options, peak_hours)
SELECT 
    id,
    CASE 
        WHEN name = 'Central Dining Hall' 
        THEN ARRAY['Local', 'Continental', 'Vegetarian']
        ELSE ARRAY['Asian', 'African', 'European', 'Middle Eastern']
    END,
    CASE 
        WHEN name = 'Central Dining Hall' THEN 500
        ELSE 300
    END,
    true,
    ARRAY['vegetarian', 'vegan', 'gluten-free', 'halal'],
    '{"breakfast":"07:00-09:00","lunch":"12:00-14:00","dinner":"17:00-19:00"}'::jsonb
FROM dining_insert;

-- Sports Facilities
WITH sports_insert AS (
    INSERT INTO locations (
        name, description, address, latitude, longitude, contact_number, 
        email, website_url, building_type, opening_hours
    ) VALUES 
    (
        'University Sports Complex',
        'Main sports facility with indoor and outdoor amenities',
        'Sports Avenue, South Campus',
        5.6374, -0.1872,
        '+233 20 123 4573',
        'sports@campus.edu',
        'https://sports.campus.edu',
        'sports',
        '{"monday":{"open":"05:30","close":"22:00"},"tuesday":{"open":"05:30","close":"22:00"},"wednesday":{"open":"05:30","close":"22:00"},"thursday":{"open":"05:30","close":"22:00"},"friday":{"open":"05:30","close":"21:00"},"saturday":{"open":"07:00","close":"20:00"},"sunday":{"open":"07:00","close":"18:00"}}'::jsonb
    ),
    (
        'Olympic Swimming Pool',
        'Olympic-standard swimming facility',
        'Aquatics Center, South Campus',
        5.6373, -0.1874,
        '+233 20 123 4574',
        'aquatics@campus.edu',
        'https://aquatics.campus.edu',
        'sports',
        '{"monday":{"open":"06:00","close":"21:00"},"tuesday":{"open":"06:00","close":"21:00"},"wednesday":{"open":"06:00","close":"21:00"},"thursday":{"open":"06:00","close":"21:00"},"friday":{"open":"06:00","close":"20:00"},"saturday":{"open":"07:00","close":"19:00"},"sunday":{"open":"07:00","close":"19:00"}}'::jsonb
    )
    RETURNING id, name
)
INSERT INTO sports_facilities (id, facility_types, indoor_outdoor, equipment_available, sports_offered, reservation_required)
SELECT 
    id,
    CASE 
        WHEN name = 'University Sports Complex' 
        THEN ARRAY['gymnasium', 'courts', 'track', 'field']
        ELSE ARRAY['swimming pool', 'diving pool', 'sauna']
    END,
    CASE 
        WHEN name = 'University Sports Complex' THEN 'both'
        ELSE 'indoor'
    END,
    true,
    CASE 
        WHEN name = 'University Sports Complex' 
        THEN ARRAY['basketball', 'volleyball', 'athletics', 'football', 'tennis']
        ELSE ARRAY['swimming', 'diving', 'water polo']
    END,
    true
FROM sports_insert;

-- Student Centers
WITH student_center_insert AS (
    INSERT INTO locations (
        name, description, address, latitude, longitude, contact_number, 
        email, website_url, building_type, opening_hours
    ) VALUES 
    (
        'Main Student Center',
        'Central hub for student activities and organizations',
        'Student Life Square, Central Campus',
        5.6378, -0.1869,
        '+233 20 123 4575',
        'studentcenter@campus.edu',
        'https://studentcenter.campus.edu',
        'student_center',
        '{"monday":{"open":"07:00","close":"23:00"},"tuesday":{"open":"07:00","close":"23:00"},"wednesday":{"open":"07:00","close":"23:00"},"thursday":{"open":"07:00","close":"23:00"},"friday":{"open":"07:00","close":"00:00"},"saturday":{"open":"09:00","close":"00:00"},"sunday":{"open":"09:00","close":"22:00"}}'::jsonb
    ),
    (
        'Innovation Hub',
        'Modern collaborative space for student projects and innovation',
        'Tech Square, East Campus',
        5.6381, -0.1867,
        '+233 20 123 4576',
        'innovation@campus.edu',
        'https://innovation.campus.edu',
        'student_center',
        '{"monday":{"open":"08:00","close":"22:00"},"tuesday":{"open":"08:00","close":"22:00"},"wednesday":{"open":"08:00","close":"22:00"},"thursday":{"open":"08:00","close":"22:00"},"friday":{"open":"08:00","close":"21:00"},"saturday":{"open":"10:00","close":"18:00"},"sunday":{"open":"10:00","close":"18:00"}}'::jsonb
    )
    RETURNING id, name
)
INSERT INTO student_centers (id, amenities, study_spaces, food_options, event_spaces, student_organizations_count)
SELECT 
    id,
    CASE 
        WHEN name = 'Main Student Center' 
        THEN ARRAY['lounge areas', 'meeting rooms', 'game room', 'prayer room', 'student offices']
        ELSE ARRAY['collaboration spaces', 'maker space', 'presentation rooms', 'quiet zones']
    END,
    true,
    CASE 
        WHEN name = 'Main Student Center' 
        THEN ARRAY['cafe', 'food court', 'vending machines']
        ELSE ARRAY['cafe', 'snack bar']
    END,
    true,
    CASE 
        WHEN name = 'Main Student Center' THEN 50
        ELSE 20
    END
FROM student_center_insert;

-- Health Services
INSERT INTO locations (name, description, address, latitude, longitude, contact_number, email, website_url, image_url, building_type)
VALUES
  ('Campus Health Clinic', 'Primary healthcare facility for students and staff', '123 Health Ave', 40.7128, -74.0060, '555-0123', 'health@campus.edu', 'https://health.campus.edu', '/images/health-clinic.jpg', 'health'),
  ('Student Wellness Center', 'Mental health and counseling services', '456 Wellness St', 40.7129, -74.0061, '555-0124', 'wellness@campus.edu', 'https://wellness.campus.edu', '/images/wellness.jpg', 'health'),
  ('University Hospital', 'Full-service teaching hospital', '789 Medical Dr', 40.7130, -74.0062, '555-0125', 'hospital@campus.edu', 'https://hospital.campus.edu', '/images/hospital.jpg', 'health'),
  ('Sports Medicine Clinic', 'Specialized care for student athletes', '321 Sports Way', 40.7131, -74.0063, '555-0126', 'sports.med@campus.edu', 'https://sportsmed.campus.edu', '/images/sports-med.jpg', 'health');

INSERT INTO health_services (id, services, specialties, emergency_services, accessibility_features, facility_type, bed_capacity, operating_hours, insurance_accepted)
SELECT 
  l.id,
  CASE 
    WHEN l.name = 'Campus Health Clinic' THEN ARRAY['Primary Care', 'Vaccinations', 'Lab Services']
    WHEN l.name = 'Student Wellness Center' THEN ARRAY['Counseling', 'Mental Health', 'Stress Management']
    WHEN l.name = 'University Hospital' THEN ARRAY['Emergency Care', 'Surgery', 'Intensive Care', 'Radiology']
    WHEN l.name = 'Sports Medicine Clinic' THEN ARRAY['Physical Therapy', 'Sports Injuries', 'Rehabilitation']
  END as services,
  CASE 
    WHEN l.name = 'Campus Health Clinic' THEN ARRAY['General Medicine', 'Family Medicine']
    WHEN l.name = 'Student Wellness Center' THEN ARRAY['Psychology', 'Psychiatry']
    WHEN l.name = 'University Hospital' THEN ARRAY['Emergency Medicine', 'Surgery', 'Internal Medicine', 'Pediatrics']
    WHEN l.name = 'Sports Medicine Clinic' THEN ARRAY['Sports Medicine', 'Orthopedics']
  END as specialties,
  CASE 
    WHEN l.name IN ('University Hospital') THEN true
    ELSE false
  END as emergency_services,
  ARRAY['Wheelchair Access', 'Elevators', 'Accessible Restrooms'] as accessibility_features,
  CASE 
    WHEN l.name IN ('University Hospital') THEN 'hospital'
    ELSE 'clinic'
  END as facility_type,
  CASE 
    WHEN l.name = 'University Hospital' THEN 200
    ELSE null
  END as bed_capacity,
  CASE 
    WHEN l.name = 'Campus Health Clinic' THEN '{"weekdays": "8:00-18:00", "weekends": "9:00-13:00"}'::jsonb
    WHEN l.name = 'Student Wellness Center' THEN '{"weekdays": "9:00-17:00", "weekends": "Closed"}'::jsonb
    WHEN l.name = 'University Hospital' THEN '{"weekdays": "24/7", "weekends": "24/7"}'::jsonb
    WHEN l.name = 'Sports Medicine Clinic' THEN '{"weekdays": "8:00-20:00", "weekends": "10:00-16:00"}'::jsonb
  END as operating_hours,
  CASE 
    WHEN l.name = 'Campus Health Clinic' THEN ARRAY['Student Health Insurance', 'Medicare', 'Blue Cross']
    WHEN l.name = 'Student Wellness Center' THEN ARRAY['Student Health Insurance']
    WHEN l.name = 'University Hospital' THEN ARRAY['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'United Healthcare']
    WHEN l.name = 'Sports Medicine Clinic' THEN ARRAY['Student Health Insurance', 'Blue Cross', 'Aetna']
  END as insurance_accepted
FROM locations l
WHERE l.building_type = 'health';
