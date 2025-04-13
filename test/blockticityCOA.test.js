const { expect } = require("chai");

describe("BlockticityCOA", function () {
  let BlockticityCOA, coa, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    BlockticityCOA = await ethers.getContractFactory("BlockticityCOA");
    coa = await BlockticityCOA.deploy();
    await coa.deployed();
  });

  it("should deploy with correct name and symbol", async function () {
    expect(await coa.name()).to.equal("Blockticity COA");
    expect(await coa.symbol()).to.equal("BTIC");
  });

  it("should mint a new COA to recipient", async function () {
    const tokenURI = "https://example.com/metadata/1.json";
    const tx = await coa.mintTo(addr1.address, tokenURI);
    await tx.wait();

    expect(await coa.ownerOf(0)).to.equal(addr1.address);
    expect(await coa.tokenURI(0)).to.equal(tokenURI);
    expect(await coa.getCurrentTokenId()).to.equal(1);
  });

  it("should not allow non-owner to mint", async function () {
    const tokenURI = "https://example.com/metadata/2.json";
    await expect(
      coa.connect(addr1).mintTo(addr1.address, tokenURI)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
