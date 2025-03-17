import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { PersonRequest, PersonResponse } from './person.interface';

@Injectable()
export class PersonService {
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

async *getAllPeople(): AsyncIterableIterator<PersonResponse> {
  console.log('getAllPeople called in service - start');
  
  try {
    // Buscar todos os registros
    const people = await this.personRepository.find();
    console.log(`Found ${people?.length || 0} records in database`);

    // Se não encontrou registros
    if (!people || people.length === 0) {
      console.log('No records found in database');
      return;
    }

    // Processar cada registro
    for (const person of people) {
      console.log(`Processing person ID: ${person.id}`);
      
      const response: PersonResponse = {
        id: person.id,
        name: person.name,
        lastName: person.lastName,
        age: person.age,
        weight: person.weight,
        localId: person.localId,
        saved: true,
        message: '',
        createdAt: person.createdAt?.toISOString() || '',
        syncedAt: person.syncedAt?.toISOString() || ''
      };

      console.log(`Yielding person ID: ${person.id}`);
      yield response;
    }

    console.log('getAllPeople called in service - end');
  } catch (error) {
    console.error('Error in service getAllPeople:', error);
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
  console.log('Service: Starting updatePerson');
  try {
      // Buscar a pessoa pelo ServerId (ID do PostgreSQL)
      const serverId = parseInt(data.localId); // Aqui estamos recebendo o ServerId
      console.log(`Service: Looking for person with PostgreSQL ID: ${serverId}`);
  
      const person = await this.personRepository.findOne({
          where: { id: serverId }
      });
  
      if (!person) {
          console.error('Service: Person not found with PostgreSQL ID:', serverId);
          throw new Error(`Person not found with PostgreSQL ID: ${serverId}`);
      }
  
      console.log('Service: Found person to update:', person);
  
      // Atualizar os campos
      person.age = data.age;
      person.weight = data.weight;
      person.syncedAt = new Date();
  
      // Salvar as alterações
      const updated = await this.personRepository.save(person);
      console.log('Service: Person updated successfully:', updated);
  
      return {
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
  } catch (error) {
      console.error('Service: Error updating person:', error);
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
}