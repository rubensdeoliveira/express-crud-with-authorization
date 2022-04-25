type User = {
  name: string
  email: string
  birthdate: Date
  phone: string
  cpf: string
  preferences: {
    appointmentMinTime: number
    appointmentMaxTime: number
  }
  address: {
    cep: string
    street: string
    neighborhood: string
    number: string
    city: string
    state: string
  }
  password: string
}

export const fakeUser1: User = {
  name: 'Harry',
  email: 'hpotter@gmail.com',
  birthdate: new Date('1980-07-31'),
  phone: '84999997777',
  cpf: '11111111111',
  preferences: {
    appointmentMinTime: 7,
    appointmentMaxTime: 18
  },
  address: {
    cep: '11111-111',
    street: 'Rua dos Alfineiros',
    neighborhood: 'Little Whinging',
    number: '4',
    city: 'Londres',
    state: 'RN'
  },
  password: 'edwiges'
}

export const fakeUser2: User = {
  name: 'Ronald',
  email: 'rwesley@gmail.com',
  birthdate: new Date('1980-03-01'),
  phone: '84999998888',
  cpf: '22222222222',
  preferences: {
    appointmentMinTime: 7,
    appointmentMaxTime: 18
  },
  address: {
    cep: '22222-222',
    street: 'Rua da Toca',
    neighborhood: 'Bairro da Toca',
    number: '5',
    city: 'Arredores de Londres',
    state: 'PB'
  },
  password: 'perebas'
}

export const fakeUser3: User = {
  name: 'Hermione',
  email: 'hgranger@gmail.com',
  birthdate: new Date('1979-09-19'),
  phone: '84999999999',
  cpf: '33333333333',
  preferences: {
    appointmentMinTime: 7,
    appointmentMaxTime: 18
  },
  address: {
    cep: '33333-333',
    street: 'Rua dos Dentistas',
    neighborhood: 'Bairro dos Dentistas',
    number: '6',
    city: 'Londres (centro)',
    state: 'CE'
  },
  password: 'ilovestudymagic'
}

export const fakeUser4: User = {
  name: 'Sirius',
  email: 'sblack@gmail.com',
  birthdate: new Date('1979-09-19'),
  phone: '84999996666',
  cpf: '44444444444',
  preferences: {
    appointmentMinTime: 7,
    appointmentMaxTime: 18
  },
  address: {
    cep: '44444-444',
    street: 'Rua dos Almofadinhas',
    neighborhood: 'Bairro dos Almofadinhas',
    number: '7',
    city: 'Londres (Bairro)',
    state: 'SP'
  },
  password: 'tiagoisthebest'
}
