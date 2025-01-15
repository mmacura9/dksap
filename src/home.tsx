import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to the receiver page when the component is mounted
    navigate('/receiver');
  }, [navigate]);

  return <div>Loading...</div>; // You can optionally show a loading message while redirecting
};

export default Home;
