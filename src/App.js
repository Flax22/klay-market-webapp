import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import QRCode from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faWallet, faPlus } from "@fortawesome/free-solid-svg-icons";
import { readCount, getBalance, setCount, fetchCardsOf } from "./api/UseCaver";
import * as KlipAPI from "./api/UseKlip";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./market.css";
import {
  Alert,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Nav,
  Row,
  Col,
} from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from "./constants";

// 1 Smart Contract: Address of COUNT_CONTRACT (SMCT)
// 2 caver.js connect with Smart Contract
// 3 Output the result (data) run by Smart Contract on Website.

// Cách tạo hàm
// Cách 01
function onPressButton(balance) {
  console.log("hi");
}
// Cách 02
const onPressButton2 = (_balance, _setBalance) => {
  _setBalance(_balance);
  // useState()
};
const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x0000000000000000000";
function App() {
  // State Data

  // Global Data
  // address
  // NFT
  const [nfts, setNfts] = useState([]); // [{id: '100', uri: '...'}]
  const [myBalance, setMyBalance] = useState("0");
  // const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS);
  const [myAddress, setMyAddress] = useState(
    DEFAULT_ADDRESS
  );

  // UI
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);
  // tab
  const [tab, setTab] = useState("MARKET"); // MARKET, MINT, WALLET
  const [mintImageUrl, setMintImageUrl] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "MODAL",
    onConfirm: () => {},
  });

  const rows = nfts.slice(nfts.length / 2);

  // fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  };
  // fetchMyNFTs
  const fetchMyNFTs = async () => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    const _nfts = await fetchCardsOf(myAddress);
    // const _nfts = await fetchCardsOf(
    //   "0xDA09bECaF24D659896252cd062dC91AbA4Af244b"
    // );
    setNfts(_nfts);
    // [{tokenId:100;  tokenUri: "https://...."-Img link}]
    // Function for check:
    // + balanceOf(in ra tổng số NFT token hiện có) --> Kết quả: 2 NFTs
    // + tokenOfOwnerbyIndex (in ra từng NFT token đang có) cách thức nhập: địa chỉ sở hữu, số index của NFT Token (0-->100)
    // + tokenURI: in ra thông tin của NFT khi nhập TokenID vào
  };
  // onClickMint
  const onClickMint = async (uri) => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    const randomTokenId = parseInt(Math.random() * 10000000);
    KlipAPI.mintCardWithURI(
      myAddress,
      randomTokenId,
      uri,
      setQrvalue,
      (result) => {
        alert(JSON.stringify(result));
      }
    );
  };
  // onClickMyCard
  const onClickCard = (id) => {
    if (tab === "WALLET") {
      // NFT를 마켓에 게시하시겠습니까? : Bạn có muốn đăng NFT lên Market không?
      setModalProps({
        title: "NFT를 마켓에 게시하시겠습니까?",
        onConfirm: () => {
          onClickMyCard(id);
        },
      });
      setShowModal(true);
    }
    if (tab === "MARKET") {
      // NFT를 구매하시겠습니까? : Bạn có muốn mua NFT không?
      setModalProps({
        title: "NFT를 구매하시겠습니까??",
        onConfirm: () => {
          onClickMarketCard(id);
        },
      });
      setShowModal(true);
    }
  };
  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  };
  // onClickMarketCard
  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  };
  // getUserData
  const getUserData = () => {
    setModalProps({
      title: "Klip 지갑을 연동하시겠습니까?", //"Klip 지갑을 연동하시겠습니까?" : Bạn có muốn liên kết ví Klip không?
      onConfirm: () => {
        KlipAPI.getAddress(setQrvalue, async (address) => {
          setMyAddress(address);
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      },
    });
    setShowModal(true);
  };
  // getBalance('0x38a5ad41fd7232bBC8c369285059330050C0dabf');

  useEffect(() => {
    getUserData();
    fetchMarketNFTs();
  }, []);

  return (
    <div className="App">
      <div style={{ backgroundColor: "black", padding: 10 }}>
        {/* 주소(Địa chỉ) - 자금(Số dư) */}
        <div
          style={{
            fontSize: 30,
            fontWeight: "bold",
            paddingLeft: 5,
            marginTop: 10,
          }}
        >
          내 지갑 - Ví của tôi
        </div>
        {myAddress}
        <br />
        <Alert
          onClick={getUserData}
          variant={"balance"}
          style={{
            backgroundColor: "#7d9fd9",
            fontSize: 25,
          }}
        >
          {myAddress !== DEFAULT_ADDRESS ? `${myBalance} KLAY` : "지갑연결하기"}
          {/*지갑연결하기: Kết nối ví của bạn */}
        </Alert>
        {qrvalue !== "DEFAULT" ? (
          <Container
            style={{
              backgroundColor: "white",
              width: 300,
              height: 300,
              padding: 20,
            }}
          >
            <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />
          </Container>
        ) : null}
        <br />
        {/* 갤러리(Gallery)-마켓 Market, 내 지갑 Ví của tôi*/}
        {tab === "MARKET" || tab === "WALLET" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row key={`rowkey${rowIndex}`}>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  <Card
                    onClick={() => {
                      onClickCard(nfts[rowIndex * 2].id);
                    }}
                  >
                    <Card.Img src={nfts[rowIndex * 2].uri} />
                  </Card>
                  [{nfts[rowIndex * 2].id}]NFT
                </Col>

                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card
                      onClick={() => {
                        onClickCard(nfts[rowIndex * 2 + 1].id);
                      }}
                    >
                      <Card.Img src={nfts[rowIndex * 2 + 1].uri} />
                    </Card>
                  ) : null}
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <>[{nfts[rowIndex * 2 + 1].id}]NFT</>
                  ) : null}
                </Col>
              </Row>
            ))}
            {/* {nfts.map((nft, index) => (
              <Card.Img
                key={`imagekey${index}`}
                onClick={() => {
                  onClickCard(nft.id);
                }}
                className="img-responsive"
                src={nfts[index].uri}
              />
            ))} */}{" "}
            {/* YOU CAN REMOVE IT */}
          </div>
        ) : null}
        {/* 릴리스 페이지(Page Phát hành) */}
        {/* mintInput */}
        {tab === "MINT" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            <Card
              className="text-center"
              style={{ color: "black", height: "50%", borderColor: "#770ef5" }}
            >
              <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
                {mintImageUrl !== "" ? (
                  <Card.Img src={mintImageUrl} height={"50%"} />
                ) : null}
                <Form>
                  <Form.Group>
                    <Form.Control
                      value={mintImageUrl}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintImageUrl(e.target.value);
                      }}
                      type="text"
                      placeholder="Enter the URL of the image here...." // Korea Translate: 여기에 사진의 주소를 입력하세요
                    />
                  </Form.Group>
                  <br />
                  <Button
                    onClick={() => {
                      onClickMint(mintImageUrl);
                    }}
                    variant="primary"
                    style={{
                      backgroundColor: "#147878",
                      borderColor: "#147878",
                    }}
                  >
                    풀어 주다 - Phát hành
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        ) : null}
      </div>
      <br />
      <br />
      <br />
      <br />
      {/* 모달(Modal) */}
      <Modal
        centered
        size="sm"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
      >
        <Modal.Header
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Modal.Title>{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Footer
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
            }}
          >
            닫기
          </Button>
          {/* 닫기: Đóng */}
          <Button
            variant="primary"
            onClick={() => {
              modalProps.onConfirm();
              setShowModal(false);
            }}
            style={{ backgroundColor: "#810034", borderColor: "#810034" }}
          >
            동의
          </Button>
          {/* 동의: Đồng ý */}
        </Modal.Footer>
      </Modal>
      {/* 탭(Tab) */}
      <nav
        style={{ backgroundColor: "#1b1717", height: 45 }}
        className="navbar fixed-bottom navbar-light"
        role="navigation"
      >
        <Nav className="w-100">
          <div className="d-flex flex-row justify-content-around w-100">
            <div
              onClick={() => {
                setTab("MARKET");
                fetchMarketNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faHome} />
              </div>
            </div>

            <div
              onClick={() => {
                setTab("MINT");
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faPlus} />
              </div>
            </div>

            <div
              onClick={() => {
                setTab("WALLET");
                fetchMyNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faWallet} />
              </div>
            </div>
          </div>
        </Nav>
      </nav>
      {/* <img src={logo} className="App-logo" alt="logo" /> */}
      {/* <button title='Change Count' onClick={()=>{setCount(100)}} /> */}
    </div>
  );
}

export default App;
