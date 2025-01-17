const hre = require("hardhat");

async function main() {
    const ens = await hre.ethers.getContractFactory("StealthAddressRegistry");
    const ephermalKeyRegistry = await hre.ethers.getContractFactory("EphemeralPubKeyRegistry");

    const ensContract = await ens.deploy();
    const ephermalKeyRegistryContract = await ephermalKeyRegistry.deploy();

    await ensContract.deployed();
    await ephermalKeyRegistryContract.deployed();

    console.log("ENS contract deployed to:", ensContract.address);
    console.log("Ephermal Key Registry contract deployed to: ",ephermalKeyRegistryContract.address());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
