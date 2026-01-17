import React, { memo, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import Deck from '../desktop/Deck';
import { useDeck } from '../../contexts/DeckContext';
import { useSwipeable } from '../../hooks/useSwipeable';

const MobileDeckView: React.FC = () => {
  const { activeDeck, setActiveDeck, deckARef, deckBRef } = useDeck();
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useSwipeable({
    onSwipedLeft: () => setActiveDeck('B'),
    onSwipedRight: () => setActiveDeck('A')
  });

  useEffect(() => {
    api.start({ x: activeDeck === 'A' ? 0 : -100 });
  }, [activeDeck, api]);

  return (
    <div
      {...bind()}
      className="relative overflow-hidden w-full h-full touch-pan-y"
    >
      <animated.div
        className="flex w-[200%] h-full"
        style={{ transform: x.to(value => `translateX(${value}%)`) }}
      >
        <div className="w-full h-full px-2">
          <Deck ref={deckARef} id="A" />
        </div>
        <div className="w-full h-full px-2">
          <Deck ref={deckBRef} id="B" />
        </div>
      </animated.div>
    </div>
  );
};

export default memo(MobileDeckView);
