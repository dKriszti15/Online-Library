CREATE TABLE IF NOT EXISTS konyvek (
    isbn varchar(13) PRIMARY KEY,
    cim varchar(25),
    szerzo varchar(25),
    kiadasi_ev int(4),
    osszefoglalo varchar(150),
    borito varchar(50),
    peldanyok int,
    osszkolcsonzesek INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS felhasznalok (
    nev varchar(50) PRIMARY KEY,
    jelszo varchar(200),
    szerepkor varchar(25)
);

CREATE TABLE IF NOT EXISTS kolcsonzesek (
    isbn varchar(13),
    nev varchar(50),
    PRIMARY KEY (isbn, nev),
    FOREIGN KEY (isbn) REFERENCES konyvek(isbn) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nev) REFERENCES felhasznalok(nev) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS ertekelesek (
    isbn varchar(13),
    cim varchar(50),
    nev varchar(50),
    ertekeles INT,
    PRIMARY KEY (isbn, nev),
    FOREIGN KEY (isbn) REFERENCES konyvek(isbn) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nev) REFERENCES felhasznalok(nev) ON DELETE CASCADE ON UPDATE CASCADE
);

