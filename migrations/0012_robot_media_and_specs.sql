ALTER TABLE entities ADD COLUMN hero_image_url TEXT;
ALTER TABLE entities ADD COLUMN image_source TEXT;
ALTER TABLE entities ADD COLUMN image_source_url TEXT;
ALTER TABLE entities ADD COLUMN image_usage_note TEXT;

UPDATE entities
SET hero_image_url = 'https://raw.githubusercontent.com/enactic/openarm/main/website/static/img/hardware/openarm_and_cell.png',
    image_source = 'OpenArm official GitHub README',
    image_source_url = 'https://github.com/enactic/openarm',
    image_usage_note = 'Official project image, displayed with source attribution.'
WHERE slug = 'openarm';

UPDATE robotics_profiles
SET metadata_json = '{"dof":"7 per arm","robot_type":"Humanoid robot arm","hardware_openness":"Open hardware","software_openness":"Open source","availability":"Commercial and DIY","ros_support":"ROS 2","simulation":["MuJoCo","Isaac Lab"],"software_ecosystem":["ROS 2","MuJoCo","Isaac Lab","Dora","Python API"],"teleoperation":"Unilateral and bilateral","configuration":"Bimanual system"}',
    source_url = 'https://github.com/enactic/openarm',
    updated_at = datetime('now')
WHERE entity_id = 'robotics_openarm';
