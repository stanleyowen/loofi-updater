import React from 'react';

import Logs from './logs.component';
import Home from './home.component';
import Settings from './settings.component';

// eslint-disable-next-line
const BaseLayout = ({
    song,
    properties,
    songData,
    handleSong,
    HOST_DOMAIN,
    rawSongData,
    handleChange,
}: any) => {
    return (
        <div className="base">
            {properties.activeTab === 'home' ? (
                <Home
                    properties={properties}
                    handleSong={handleSong}
                    song={song}
                    songData={songData}
                    HOST_DOMAIN={HOST_DOMAIN}
                    handleChange={handleChange}
                />
            ) : properties.activeTab === 'logs' ? (
                <Logs properties={properties} HOST_DOMAIN={HOST_DOMAIN} />
            ) : (
                <Settings />
            )}
        </div>
    );
};

export default BaseLayout;
