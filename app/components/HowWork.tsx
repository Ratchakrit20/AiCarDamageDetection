import Image from "next/image";

const HowWork = () => {
  return (
    <div className="  p-10 rounded-[13px] mx-auto my-5 text-white">
      {/* Title */}
      <h2 className="text-center  text-2xl font-semibold mb-8">
        How it Works
        <div className="w-16 h-1 bg-primary-orange mx-auto mt-2"></div>
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto ">
        {/* Damage Classification */}
        <div className="box bg-[#77777711] bg-opacity-30 p-6 rounded-lg flex flex-col justify-center items-center">
          <div className="flex flex-col items-center">
            <img
              src="/img/damage-classification.png"
              alt="Damage Classification"
              className="w-40 h-40 mb-6"
            />
            <p className="text-lg font-medium text-center">Damage Classification</p>
          </div>
        </div>

        {/* Repair Cost Estimation */}
        <div className="box bg-[#77777711] bg-opacity-30 p-6 rounded-lg flex flex-col justify-center items-center">
          <div className="flex flex-col items-center">
            <img
              src="/img/repair-cost.png"
              alt="Repair Cost Estimation"
              className="w-40 h-40 mb-6"
            />
            <p className="text-lg font-medium text-center">Repair Cost Estimation</p>
          </div>
        </div>

        {/* Insurance Claim Documentation */}
        <div className="box bg-[#77777711] bg-opacity-30 p-6 rounded-lg flex flex-col justify-center items-center">
          <div className="flex flex-col items-center">
            <img
              src="/img/insurance-documentation.png"
              alt="Insurance Claim Documentation"
              className="w-40 h-40 mb-6"
            />
            <p className="text-lg font-medium text-center">
              Insurance Claim Documentation
            </p>
          </div>
        </div>

        {/* Spare Parts Pricing Information */}
        <div className="box bg-[#77777711] bg-opacity-30 p-6 rounded-lg flex flex-col justify-center items-center">
          <div className="flex flex-col items-center">
            <img
              src="/img/ai.png"
              alt="Spare Parts Pricing Information"
              className="w-40 h-40 mb-6"
            />
            <p className="text-lg font-medium text-center">AI Management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWork;
