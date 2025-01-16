const hre = require("hardhat");

async function main() {
    const ens = await hre.ethers.getContractFactory("StealthAddressRegistry");
    const contract = await ens.deploy();

    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
