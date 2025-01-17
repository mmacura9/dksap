const hre = require("hardhat");

async function main() {
    const StealthAddressRegistry = await hre.ethers.getContractFactory("StealthAddressRegistry");
    const contract = await StealthAddressRegistry.deploy();

    console.log("Contract deployed to:", contract.target); // Use `target` to get the address
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
