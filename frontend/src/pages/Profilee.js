import React, { useEffect, useState } from 'react';
import { Card, Avatar, Descriptions, Button, Spin, message, Upload } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import BgProfile from 'assets/images/bg-profile.jpg';
import axios from 'axios';
import { useAuthContext } from '../contexts/AuthContext';  // Import your useAuthContext hook

const Profile = () => {
  const { user: authUser, loading: authLoading } = useAuthContext();  // Get the user and loading state from AuthContext
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser?._id) return; // Ensure userId (from authUser) exists

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:4000/api/getuser/${authUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data.user);  // Set the fetched user data
        // Store the profile image URL in local storage
        localStorage.setItem('profileImage', response.data.user.profileImage || '');
      } catch (error) {
        message.error('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {  // Only fetch if auth context loading is done
      fetchUser();
    }
  }, [authUser, authLoading, token]);  // Add authUser and authLoading as dependencies

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await axios.post(`http://localhost:4000/api/upload/${authUser._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Profile image uploaded successfully');
      setUser(response.data.user); // Update the user state with the new image URL
      // Store the new profile image URL in local storage
      localStorage.setItem('profileImage', response.data.user.profileImage);
    } catch (error) {
      message.error('Error uploading profile image');
    } finally {
      setUploading(false);
    }
  };

  // Retrieve the profile image URL from local storage
  const profileImageFromStorage = localStorage.getItem('profileImage');

  if (loading || authLoading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}  />;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', backgroundImage: `url(${BgProfile})` }} >
      <Card
        style={{ width: 400, borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        cover={
          <Avatar
            size={120}
            src={profileImageFromStorage ? `http://localhost:4000/api/profileimage/${profileImageFromStorage}` : undefined}
            icon={!profileImageFromStorage && <UserOutlined />}
            style={{ margin: '20px auto', display: 'block' }}
          />
        }
      >
        <Descriptions title="User Profile" column={1}>
          <Descriptions.Item label="Full Name">{user?.FullName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Email">
            <MailOutlined /> {user?.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            <PhoneOutlined /> {user?.phone || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Role">{user?.role || 'User'}</Descriptions.Item>
        </Descriptions>

        <Upload
          customRequest={({ file, onSuccess, onError }) => {
            handleUpload(file).then(onSuccess).catch(onError);
          }}
          showUploadList={false}
          maxCount={1}
          accept="image/jpeg, image/png"
        >
          <Button 
            icon={<UploadOutlined />} 
            style={{ marginTop: '20px', borderRadius: '5px' }}
            loading={uploading}
          >
            {uploading ? 'Uploading' : 'Upload Profile Image'}
          </Button>
        </Upload>
        
        <Button type="primary" block style={{ marginTop: '20px', borderRadius: '5px' }}>
          Edit Profile
        </Button>
      </Card>
    </div>
  );
};

export default Profile;
