import { useEffect } from 'react';

import { Blackout } from './features/board/Blackout';
import { Board } from './features/board/Board';
import { Orders } from './features/orders/Orders';
import { Phone } from './features/phone/Phone';
import { usePlantState } from './features/plant/plantContext';
import { Plates } from './features/plates/Plates';
import { Recorder } from './features/recorder/Recorder';
import { Tuner } from './features/tuner/Tuner';

export function App() {
  const { dark } = usePlantState();

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <>
      <div inert={dark}>
        <main>
          <Board />
          <Recorder />
          <Orders />
          <Tuner />
          <Plates />
        </main>
        <Phone />
      </div>
      <Blackout />
    </>
  );
}
