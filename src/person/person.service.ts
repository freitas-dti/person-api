import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { PersonRequest, PersonResponse } from './person.interface';

@Injectable()
export class PersonService {
  update(id: number, arg1: { name: string; lastName: string; age: number; weight: number; localId: string; createdAt: Date; }) {
    throw new Error('Method not implemented.');
  }
  private firstNames = [
    'Miguel', 'Arthur', 'Heitor', 'Helena', 'Alice', 'Theo',
    'Laura', 'Davi', 'Gabriel', 'Gael', 'Bernardo', 'Samuel',
    'Valentina', 'João', 'Maria', 'Pedro', 'Isabella', 'Lucas',
    'Ana', 'Benjamin'
  ];

  private lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
    'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro',
    'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes',
    'Vieira', 'Barbosa'
  ];

constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
) {
  console.log('PersonService constructor called');
}

async savePerson(data: any): Promise<Person> {
    const person = this.personRepository.create({
        name: data.name,
        lastName: data.lastName,
        age: data.age,
        weight: data.weight,
        localId: data.localId,
        createdAt: new Date(data.createdAt),  // Data de criação no servidor
        syncedAt: new Date()    // Data de sincronização
    });

    console.log('Saving person with dates:', {
        createdAt: person.createdAt,
        syncedAt: person.syncedAt
    });

    return await this.personRepository.save(person);
}

async syncPeople(people: any[]): Promise<string[]> {
    const syncedIds: string[] = [];

    try {
        for (const personData of people) {
            console.log('Processing person:', personData);
            
            const person = this.personRepository.create({
                name: personData.name,
                lastName: personData.lastName,
                age: personData.age,
                weight: personData.weight,
                localId: personData.localId,
                createdAt: new Date(personData.createdAt), // Usa a data de criação original
                syncedAt: new Date() // Nova data de sincronização
            });

            const savedPerson = await this.personRepository.save(person);
            syncedIds.push(personData.localId);
            
            console.log(`Saved person with dates:`, {
                localId: personData.localId,
                createdAt: person.createdAt,
                syncedAt: person.syncedAt
            });
        }

        return syncedIds;
    } catch (error) {
        console.error('Error syncing people:', error);
        throw error;
    }
}

async getAllPeople(): Promise<PersonResponse[]> {
  const startTime = Date.now();
  console.log('gRPC Service: Starting getAllPeople');
  
  try {
    // Usar QueryBuilder com otimizações
    const people = await this.personRepository
      .createQueryBuilder('person')
      .select([
        'person.id',
        'person.name',
        'person.lastName',
        'person.age',
        'person.weight',
        'person.localId',
        'person.createdAt',
        'person.syncedAt'
      ])
      .orderBy('person.id')
      .getMany();
  
    console.log(`gRPC Service: Found ${people.length} records`);
  
    // Mapear todos os registros de uma vez
    const response = people.map(person => ({
      id: person.id,
      name: person.name,
      lastName: person.lastName,
      age: person.age,
      weight: person.weight,
      localId: person.localId,
      saved: true,
      message: '',
      createdAt: person.createdAt.toISOString(),
      syncedAt: person.syncedAt?.toISOString() || ''
    }));
  
    const totalDuration = Date.now() - startTime;
    console.log(`gRPC Service: Completed getAllPeople in ${totalDuration}ms`);
  
    return response;
  } catch (error) {
    console.error('gRPC Service: Error in getAllPeople:', error);
    throw error;
  }
  }
// Método de teste para verificar se o serviço está funcionando
async test() {
  console.log('Test method called in service');
  const people = await this.personRepository.find();
  console.log(`Found ${people?.length || 0} records in test method`);
  return people;
}

async updatePerson(data: PersonRequest): Promise<PersonResponse> {
  const startTime = Date.now();
  console.log('gRPC Service: Starting update');
  
  try {
    // Usar queryBuilder para melhor performance
    const serverId = parseInt(data.localId);
    console.log(`gRPC Service: Looking for person with ID: ${serverId}`);

    const person = await this.personRepository
      .createQueryBuilder('person')
      .where('person.id = :id', { id: serverId })
      .getOne();

    if (!person) {
      throw new Error(`Person not found with ID: ${serverId}`);
    }

    const queryTime = Date.now() - startTime;
    console.log(`gRPC Service: Found person in ${queryTime}ms`);

    // Atualizar campos
    const updateStart = Date.now();
    person.age = data.age;
    person.weight = data.weight;
    person.syncedAt = new Date();

    // Salvar atualização
    const updated = await this.personRepository.save(person);
    const updateTime = Date.now() - updateStart;
    console.log(`gRPC Service: Save completed in ${updateTime}ms`);

    const response: PersonResponse = {
      id: updated.id,
      name: updated.name,
      lastName: updated.lastName,
      age: updated.age,
      weight: updated.weight,
      localId: updated.localId,
      saved: true,
      message: 'Successfully updated',
      createdAt: updated.createdAt.toISOString(),
      syncedAt: updated.syncedAt.toISOString()
    };

    const totalDuration = Date.now() - startTime;
    console.log(`gRPC Service: Total operation time: ${totalDuration}ms`);
    console.log('gRPC Service: Performance breakdown:');
    console.log(`- Query time: ${queryTime}ms`);
    console.log(`- Update time: ${updateTime}ms`);
    console.log(`- Total time: ${totalDuration}ms`);

    return response;
  } catch (error) {
    console.error('gRPC Service: Error:', error);
    throw error;
  }
}

  private getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Para testar, você pode usar o curl:
    curl -X POST http://localhost:3000/api/person/generate-random \
    -H "Content-Type: application/json" \
    -d '{"count": 100}'
    Ou usando o Postman:

    Método: POST
    URL: http://localhost:3000/api/person/generate-random
    Body (raw/JSON):
    {
      "count": 100
    }
   * @param count 
   * @returns 
   */
  async generateRandomPeople(count: number = 100): Promise<{ success: boolean, count: number }> {
    try {
      console.log(`Starting to generate ${count} random people...`);
      const batch: Person[] = []; // Especificando o tipo do array
      let localId = 1;
  
      for (let i = 0; i < count; i++) {
        const person = new Person();
        person.name = this.getRandomElement(this.firstNames);
        person.lastName = this.getRandomElement(this.lastNames);
        person.age = Math.floor(Math.random() * (80 - 18 + 1)) + 18;
        person.weight = Number((Math.random() * (120 - 50) + 50).toFixed(1));
        person.localId = (localId++).toString();
        person.createdAt = new Date();
        person.syncedAt = new Date();
        
        batch.push(person);
        console.log(`Generated person: ${person.name} ${person.lastName}`);
      }
  
      const savedPeople = await this.personRepository.save(batch);
      console.log(`Successfully saved ${savedPeople.length} people`);
  
      return { 
        success: true, 
        count: savedPeople.length 
      };
    } catch (error) {
      console.error('Error generating random people:', error);
      throw error;
    }
  }

  // REST
  async findAllRest(): Promise<Person[]> {
    console.log('Service: Finding all people');
    try {
      const people = await this.personRepository.find({
        order: {
          id: 'ASC'
        }
      });
      console.log(`Service: Found ${people.length} people`);
      return people;
    } catch (error) {
      console.error('Service: Error finding all people:', error);
      throw error;
    }
  }
  
  async updateRest(id: number, data: any): Promise<Person> {
    console.log(`Service: Starting update for person ${id}`);
    console.log('Service: Received data:', JSON.stringify(data));
    
    try {
        const person = await this.personRepository.findOne({
            where: { id }
        });
    
        if (!person) {
            throw new Error(`Person with ID ${id} not found`);
        }
    
        // Atualizar campos explicitamente
        if (data.name) person.name = data.name;
        if (data.lastName) person.lastName = data.lastName;
        if (data.age !== undefined) person.age = data.age;
        if (data.weight !== undefined) person.weight = data.weight;
        person.syncedAt = new Date();
    
        console.log('Service: Person after updates:', JSON.stringify(person));
    
        const updated = await this.personRepository.save(person);
        console.log('Service: Update successful:', JSON.stringify(updated));
    
        return updated;
    } catch (error) {
        console.error(`Service: Error updating person ${id}:`, error);
        throw error;
    }
    }
}