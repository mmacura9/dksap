const hre = require("hardhat");

async function main() {
    const StealthAddressRegistry = await hre.ethers.getContractFactory("StealthAddressRegistry");
    const ensContract = await StealthAddressRegistry.deploy();

    const EphemeralPubKeyRegistry = await hre.ethers.getContractFactory("EphemeralPubKeyRegistry");
    const ephermalKeyRegistryContract = await EphemeralPubKeyRegistry.deploy(); 

    console.log("ENS ontract deployed to:", ensContract.target); // Use `target` to get the address
    console.log("Ephermal pubkey contract deployed to:", ephermalKeyRegistryContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });