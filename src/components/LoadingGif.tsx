import React from 'react';
import './LoadingGif.css';

 interface LoadingGifProps {
    divs?: boolean;
  }
  
const LoadingGif: React.FC<LoadingGifProps> = ({ divs = true }) => {
  const loadingImg = (
    <div>
      <img
        src={`${process.env.PUBLIC_URL}/loading.gif`}
        alt="Loading..."
        style={{ width: '32px', height: '32px' }}
      />
    </div>
  );

  return divs ? (
    <div className="loading-gif-parent ">
      <div className="loading-gif-div">
        {loadingImg}
      </div>
    </div>
  ) : (
    loadingImg
  );
};

export default React.memo(LoadingGif);