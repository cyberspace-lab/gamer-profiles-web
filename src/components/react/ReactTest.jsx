import React, { useEffect, useState } from 'react';

export default function ReactTest(){
  const [socializer, setSocializer] = useState('');
  const [explorer, setExplorer] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const socializerParam = urlParams.get('socializer');
    const explorerParam = urlParams.get('explorer');

    if (socializerParam) {
      setSocializer(socializerParam);
    }
    if (explorerParam) {
      setExplorer(explorerParam);
    }
  }, []);

  return (
    <div>
      <p>Socializer</p>
      <p>Explorer</p>
    </div>
  );
};