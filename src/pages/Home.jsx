import { useEffect, useState } from 'react';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="@container main homepage">
      {/* Custom cursor with "coming soon" text */}
      {isHoveringImage && (
        <div 
          className="fixed z-50 pointer-events-none bg-orange text-white px-3 py-1 rounded-full text-sm whitespace-nowrap"
          style={{
            left: `${cursorPosition.x + 20}px`,
            top: `${cursorPosition.y + 20}px`,
          }}
        >
          COMING SOON
        </div>
      )}
      
      {/* Parallax header section */}
      <div className="h-[100vh] relative overflow-hidden">
        <img
          src="/images/lamps.jpg"
          alt="Header Image"
          className="h-full absolute object-cover right-0 w-full cursor-pointer"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        />
      </div>
      
      {/* Image content sections */}
      <div className="md:px-25 px-10 pt-10">
        <img
          src="/images/clock.jpg"
          alt="Clock Image"
          className="h-auto md:w-[40vw] w-full cursor-pointer"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        />
        <img
          src="/images/table.jpg"
          alt="Table Image"
          className="h-auto md:w-[40vw] float-right w-full cursor-pointer"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        />
      </div>
    </div>
  );
};

export default Home;