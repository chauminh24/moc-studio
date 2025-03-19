const Home = () => {
  return (
    <div className="@container main homepage">
      <div className="h-[100vh] relative">
        <img
          src="/5x4_holder.png"
          alt="Header Image"
          className="h-full absolute object-cover right-0"
        />
      </div>
      <div className="md:px-25 px-10 pt-10">
        <img
          src="square_holder.png"
          alt="Header Image"
          className="h-auto md:w-[40vw] w-full"
        />
        <img
          src="square_holder.png"
          alt="Header Image"
          className="h-auto md:w-[40vw] float-right w-full"
        />
      </div>
    </div>
  );
};

export default Home;